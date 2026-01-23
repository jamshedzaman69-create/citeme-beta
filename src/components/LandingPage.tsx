import { useState } from 'react';
import { Quote, Zap, BookOpen, FileText } from 'lucide-react';
import Auth from './Auth';
import { FeatureCard } from './FeatureCard';
import { PricingCard } from './PricingCard';
import { TestimonialCard } from './TestimonialCard';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    { icon: Zap, title: "Instant Citations", description: "Generate accurate citations in APA, MLA, Chicago, and more formats." },
    { icon: BookOpen, title: "AI-Powered Writing", description: "Smart writing assistance that helps you structure arguments." },
    { icon: FileText, title: "Research Organization", description: "Keep all your sources, notes, and drafts organized." }
  ];

  const testimonials = [
    { name: "Dr. Sarah Chen", role: "PhD Candidate, MIT", content: "CiteMe has completely transformed my research workflow.", avatar: "SC" },
    { name: "Marcus Rodriguez", role: "Graduate Student, Stanford", content: "As someone writing multiple papers, CiteMe keeps everything organized.", avatar: "MR" },
    { name: "Prof. Emily Watson", role: "Associate Professor, Oxford", content: "I recommend CiteMe to all my students.", avatar: "EW" }
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="p-4">
          <button onClick={() => setShowAuth(false)} className="text-sm font-medium text-gray-600 hover:text-blue-600">
            ← Back to Home
          </button>
        </nav>
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Quote className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">CiteMe</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowAuth(true)} className="px-4 py-2 text-gray-700 font-medium">Sign In</button>
            <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Write Research Papers <span className="text-blue-600">with Instant Citations</span></h1>
        <button onClick={() => setShowAuth(true)} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg">Start Free Trial</button>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Researchers Worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* THIS IS THE PART THAT WAS LIKELY MISSING OR BROKEN */}
            {testimonials.map((t, i) => (
              <TestimonialCard 
                key={i} 
                name={t.name}
                role={t.role}
                content={t.content}
                avatar={t.avatar}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard name="Weekly" price="2.50" period="week" features={["Unlimited citations", "AI writing assistant"]} onSelect={() => setShowAuth(true)} />
          <PricingCard name="Monthly" price="8.00" period="month" popular features={["Everything in Weekly", "Advanced AI"]} onSelect={() => setShowAuth(true)} />
        </div>
      </section>

      <footer className="py-12 border-t text-center text-gray-500"><p>&copy; 2026 CiteMe. All rights reserved.</p></footer>
    </div>
  );
}