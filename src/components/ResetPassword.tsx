import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Step 2: Update the password for the currently logged-in user
    // (Supabase logs the user in automatically when they click the reset link)
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Secure Your Account</h2>
        <p className="text-slate-500 text-sm mb-6">Enter a new, strong password below.</p>

        {success ? (
          <div className="flex flex-col items-center py-4 text-green-600 animate-in zoom-in duration-300">
            <CheckCircle className="w-12 h-12 mb-2" />
            <p className="font-medium">Password updated!</p>
            <p className="text-xs text-slate-400 mt-1">Taking you to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-2 italic text-left">{error}</p>}

            <button
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}