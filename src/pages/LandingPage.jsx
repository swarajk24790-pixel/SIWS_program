import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  GraduationCap,
  X,
  Lock,
  Mail,
  ChevronRight
} from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useApp();
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      if (authModal === 'signup') {
        const studentName = name.trim() || email.split('@')[0].replace('.', ' ').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        await registerUser(studentName, email, password);
        navigate('/onboarding');
      } else {
        await loginUser(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.warn('Authentication failed:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-80 right-0 w-[450px] h-[350px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] shadow-glow-primary">
            <div className="w-full h-full bg-darkBg rounded-[15px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">UniPilot</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.4
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs sm:text-sm shadow-glow-primary transition-all active:scale-95"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 pt-12 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Gen Academic Assistant & Career Accelerator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-white leading-[1.1]">
          One platform for your <br />
          <span className="gradient-text">entire academic life.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Autonomous attendance calculator, exam planner, and document doubt solver paired with a 
          <span className="text-slate-200 font-medium"> unified living activity feed</span> that continuously compiles your ATS-ready resume and personal portfolio website.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:opacity-95 text-white font-bold text-sm shadow-glow-primary transition-all flex items-center justify-center gap-2"
          >
            <span>Launch UniPilot Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-darkCard/80 border border-darkBorder hover:bg-darkCardHover text-slate-200 font-semibold text-sm transition-all"
          >
            Setup Profile
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="p-6 rounded-3xl bg-darkCard/60 border border-darkBorder/80 backdrop-blur-xl hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Attendance</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              &ldquo;What-if&rdquo; calculator that tells you exactly how many lectures you can bunk or need to attend to hit 75% or 80% without guessing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-darkCard/60 border border-darkBorder/80 backdrop-blur-xl hover:border-sky-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Notes & Doubt Solver</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Upload PDFs and slide decks. Generate instant summaries, smart swipeable flashcards, and practice quizzes grounded exclusively in course notes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-darkCard/60 border border-darkBorder/80 backdrop-blur-xl hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Living Resume & Portfolio</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every hackathon, internship, course certificate, and GitHub repo feeds into one master timeline that auto-generates your ATS resume & portfolio.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 p-3 bg-darkCard/95 border-t border-darkBorder backdrop-blur-xl z-30 flex gap-2">
        <button
          onClick={() => setAuthModal('login')}
          className="flex-1 py-3 rounded-xl bg-darkBg border border-darkBorder text-white text-xs font-semibold"
        >
          Login
        </button>
        <button
          onClick={() => setAuthModal('signup')}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-primary"
        >
          Get Started
        </button>
      </div>

      {/* Auth Modal (Login / Signup) */}
      {authModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setAuthModal(null)}
        >
          <div 
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {authModal === 'signup' ? 'Create your UniPilot Account' : 'Welcome back to UniPilot'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authModal === 'signup' ? 'Start your academic journey in 30 seconds' : 'Access your dashboard, notes & sync timeline'}
              </p>
            </div>

            {/* Social Auth Option */}
            <button
              type="button"
              onClick={() => setAuthError('Google sign-in is not configured. Please use your email and password.')}
              className="w-full py-2.5 px-4 rounded-xl bg-darkBg border border-darkBorder hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-colors mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-darkBorder" />
              <span className="px-3 text-[10px] text-slate-500 uppercase">or with email</span>
              <div className="flex-1 border-t border-darkBorder" />
            </div>

            {authError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authModal === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Miller"
                      className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">College / Academic Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-glow-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <span>{authModal === 'signup' ? 'Proceed to Setup (Step 1 of 4)' : 'Sign In'}</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthModal(authModal === 'signup' ? 'login' : 'signup')}
                className="text-xs text-slate-400 hover:text-indigo-300"
              >
                {authModal === 'signup' 
                  ? 'Already have an account? Log in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
