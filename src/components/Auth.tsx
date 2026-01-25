import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Quote, ArrowLeft, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  initialMode?: 'signin' | 'signup';
}

export default function Auth({ initialMode = 'signup' }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'signin');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  // Sync state if initialMode changes
  useEffect(() => {
    setIsLogin(initialMode === 'signin');
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name');
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 animate-in fade-in zoom-in duration-500 font-sans">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
          <Quote className="text-white w-5 h-5 fill-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {showResetPassword ? 'Reset Access' : isLogin ? 'Welcome back' : 'Join CiteMe'}
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-tight">
          {showResetPassword ? "We'll send a recovery link" : 'Your research workspace awaits.'}
        </p>
      </div>

      {!showResetPassword ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text" required={!isLogin} value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium placeholder:text-slate-300"
                placeholder="Full Name"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium placeholder:text-slate-300"
              placeholder="University Email"
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium placeholder:text-slate-300"
                placeholder="Password"
              />
            </div>
            {isLogin && (
              <div className="flex justify-end pr-1">
                <button type="button" onClick={() => setShowResetPassword(true)} className="text-[10px] font-bold text-blue-600/70 hover:text-blue-600 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {error && <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold text-center border border-red-100">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>{isLogin ? 'Sign In' : 'Get Started'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" placeholder="you@university.edu" />
            </div>
            <button disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all flex justify-center items-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Link'}
            </button>
            <button type="button" onClick={() => setShowResetPassword(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 pt-1">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </form>
        </div>
      )}

      {!showResetPassword && (
        <div className="mt-6 pt-6 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-xs font-medium">
            {isLogin ? "New to CiteMe?" : "Already a member?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2 transition-all">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}