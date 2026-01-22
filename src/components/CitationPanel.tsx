import { useState } from 'react';
import { Search, Copy, Check, X, Loader2, BookOpen } from 'lucide-react';

type CitationFormat = 'MLA8' | 'Chicago' | 'APA' | 'Harvard' | 'MHRA' | 'Vancouver' | 'OSCOLA';

interface CitationRequest {
  text: string;
  format: CitationFormat;
  sampleSize?: string;
  dateRange?: string;
  location?: string;
  parameters?: string;
}

interface Citation {
  studyFindings: string;
  citation: string;
  briefDescription: string;
  location: string;
  date: string;
  participants: string;
  accessibility: string;
  link: string;
  formattedCitation: string;
}

interface CitationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

const citationFormats: CitationFormat[] = [
  'MLA8',
  'Chicago',
  'APA',
  'Harvard',
  'MHRA',
  'Vancouver',
  'OSCOLA'
];

export default function CitationPanel({ isOpen, onClose, onInsert }: CitationPanelProps) {
  const [request, setRequest] = useState<CitationRequest>({
    text: '',
    format: 'APA',
  });
  const [citation, setCitation] = useState<Citation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCitation(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/citation-generator`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error('Failed to generate citation');

      const data = await response.json();
      setCitation(data);
    } catch (err) {
      setError('Failed to generate citation. Please try again.');
      console.error('Citation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (citation?.formattedCitation) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = citation.formattedCitation;

      try {
        await navigator.clipboard.writeText(tempDiv.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  const handleInsertCitation = () => {
    if (citation?.formattedCitation) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = citation.formattedCitation;
      onInsert(tempDiv.innerText);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Citation Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!citation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What do you need a citation for?
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., I need a citation that proves oceans are warming"
                  value={request.text}
                  onChange={(e) => setRequest({ ...request, text: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Format
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={request.format}
                    onChange={(e) => setRequest({ ...request, format: e.target.value as CitationFormat })}
                  >
                    {citationFormats.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Range <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2020-2023"
                    value={request.dateRange || ''}
                    onChange={(e) => setRequest({ ...request, dateRange: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., North America"
                    value={request.location || ''}
                    onChange={(e) => setRequest({ ...request, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sample Size <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1000+"
                    value={request.sampleSize || ''}
                    onChange={(e) => setRequest({ ...request, sampleSize: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Citation...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Generate Citation
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Study Findings</h3>
                <p className="text-sm text-blue-800">{citation.studyFindings}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-600 mb-1">Date</h4>
                  <p className="text-sm text-slate-900">{citation.date}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-600 mb-1">Location</h4>
                  <p className="text-sm text-slate-900">{citation.location}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-600 mb-1">Participants</h4>
                  <p className="text-sm text-slate-900">{citation.participants}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-600 mb-1">Accessibility</h4>
                  <p className="text-sm text-slate-900">{citation.accessibility}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Formatted Citation</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        copied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleInsertCitation}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Insert into Document
                    </button>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <p
                    className="text-sm text-slate-900 font-mono"
                    dangerouslySetInnerHTML={{ __html: citation.formattedCitation }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setCitation(null);
                  setRequest({ text: '', format: 'APA' });
                }}
                className="w-full px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
              >
                Generate Another Citation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
