import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsRole, loginUser, registerUser, SAMPLE_STUDENTS } = useApp();

  // Active Login Mode: 'student' or 'guardian' (Parent / Teacher)
  const [roleTab, setRoleTab] = useState('student');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChildId, setSelectedChildId] = useState(SAMPLE_STUDENTS[0].id);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (authMode === 'signup') {
        await registerUser(name, email, password);
      } else {
        await loginUser(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    }
  };

  const handleGuardianSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    // Log in as Guardian (Parent or Teacher) and focus on selected student's dashboard
    loginAsRole('guardian', selectedChildId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 text-center cursor-pointer" onClick={() => navigate('/')}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 p-[1px] shadow-glow-primary">
            <div className="w-full h-full bg-darkBg rounded-[15px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">UniPilot</span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Portal
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-sm">
          Unified Academic Portal for Students, Parents & Faculty
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-darkCard/90 border border-darkBorder rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-darkBg border border-darkBorder mb-6 gap-1">
          <button
            type="button"
            onClick={() => { setRoleTab('student'); setErrorMsg(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleTab === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setRoleTab('guardian'); setErrorMsg(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleTab === 'guardian'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parent / Teacher</span>
          </button>
        </div>

        {/* ─── TAB 1: STUDENT LOGIN & SIGNUP ──────────────────────────── */}
        {roleTab === 'student' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-white">
                {authMode === 'login' ? 'Student Sign In' : 'Create Student Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your attendance tracker, AI solver, timetable & living resume
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Swaraj K."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student / College Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="swaraj@siws.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
              >
                <span>{authMode === 'login' ? 'Sign In as Student' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-darkBorder text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-indigo-400 hover:underline font-medium"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already registered? Sign in'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 2: PARENTS & TEACHER LOGIN ─────────────────────────── */}
        {roleTab === 'guardian' && (
          <div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-medium mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Parent & Faculty Academic Monitor</span>
              </div>
              <h2 className="text-lg font-bold text-white">Select Student / Child</h2>
              <p className="text-xs text-slate-400 mt-1">
                View real-time attendance, test performance, timetable & academic portfolio
              </p>
            </div>

            <form onSubmit={handleGuardianSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                  Select Registered Student / Child to inspect:
                </label>
                
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {SAMPLE_STUDENTS.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedChildId(student.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedChildId === student.id
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-glow-primary'
                          : 'bg-darkBg/60 border-darkBorder hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{student.name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{student.course}</p>
                          <span className="text-[10px] text-slate-500">Roll: {student.rollNo}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-extrabold ${
                          student.attendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {student.attendancePct}%
                        </span>
                        <span className="block text-[10px] text-slate-400">Attendance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Parents and faculty get direct read access to inspect this student&apos;s full dashboard.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2"
              >
                <span>Access Student Dashboard as Guardian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Quick Demo Bypass */}
        <div className="mt-5 pt-3 border-t border-darkBorder flex items-center justify-between text-[11px] text-slate-400">
          <span>Just exploring?</span>
          <button
            type="button"
            onClick={() => {
              loginAsRole('student', SAMPLE_STUDENTS[0].id);
              navigate('/dashboard');
            }}
            className="text-indigo-400 hover:underline font-semibold"
          >
            Direct Guest Access →
          </button>
        </div>
      </div>
    </div>
  );
}
