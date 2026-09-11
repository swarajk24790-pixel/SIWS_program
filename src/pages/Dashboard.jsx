import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Send, 
  BookOpen, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  Award,
  Brain,
  Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklyWorkloadChart, AttendanceThresholdChart } from '../components/VisualCharts';
import { ShieldCheck, ArrowLeft, Edit3, X, Lock } from 'lucide-react';
import CareerAdvisorWidget from '../components/CareerAdvisorWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    attendance, 
    assignments, 
    toggleAssignmentStatus, 
    setQuickAddOpen,
    activities,
    quizResults,
    adminViewingStudent,
    clearAdminViewingStudent,
    isAdmin,
    adminUpdateAttendance,
    adminSetAttendance
  } = useApp();

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [editAttended, setEditAttended] = useState(0);
  const [editHeld, setEditHeld] = useState(0);

  const activeUser = adminViewingStudent ? {
    ...user,
    id: adminViewingStudent.id,
    name: adminViewingStudent.name || user.name,
    email: adminViewingStudent.email || user.email,
    college: adminViewingStudent.college || user.college,
    course: adminViewingStudent.course || user.course,
    semester: adminViewingStudent.semester || user.semester,
    cgpa: adminViewingStudent.cgpa || user.cgpa,
  } : user;

  const activeAttendance = (adminViewingStudent?.subjects && adminViewingStudent.subjects.length > 0)
    ? adminViewingStudent.subjects
    : attendance;

  const canEditAttendance = isAdmin || !!adminViewingStudent;

  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    navigate('/chat', { state: { initialPrompt: chatInput } });
  };

  // Schedule mock for today
  const todayClasses = [
    { id: 1, name: 'Distributed Systems', time: '09:00 - 10:15 AM', room: 'Hall 402', prof: 'Prof. Chen', status: 'completed' },
    { id: 2, name: 'Database Management', time: '10:30 - 11:45 AM', room: 'Lab 3B', prof: 'Prof. Miller', status: 'current' },
    { id: 3, name: 'AI & Neural Nets', time: '01:30 - 02:45 PM', room: 'Hall 108', prof: 'Dr. Vaswani', status: 'upcoming' },
    { id: 4, name: 'Computer Networks', time: '03:15 - 04:30 PM', room: 'Lab 2A', prof: 'Dr. Tanenbaum', status: 'upcoming' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Superview Mode Sticky Header */}
      {adminViewingStudent && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-violet-950/90 via-slate-900 to-indigo-950/80 border border-violet-500/40 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/30 text-violet-200 border border-violet-400/30">
                  Admin Superview
                </span>
                <span className="text-xs text-slate-400">Viewing Live Student Dashboard</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activeUser.name} <span className="text-xs text-slate-400 font-normal">({activeUser.email || 'Student Account'})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>+ Record / Edit Attendance</span>
            </button>
            <button
              onClick={() => {
                clearAdminViewingStudent();
                navigate('/admin');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Welcome & Quick Copilot Input Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, {activeUser.name.split(' ')[0]}
            </h1>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            {activeUser.course} • {activeUser.semester} • 4 classes scheduled today
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/feed')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 text-sm font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Activity Feed ({activities.length})</span>
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Quick Add</span>
          </button>
        </div>
      </div>

      {/* Quick Pinned Chat Bar */}
      <form 
        onSubmit={handleChatSubmit}
        className="p-3 rounded-2xl bg-darkCard/80 border border-darkBorder/90 backdrop-blur-xl shadow-lg flex items-center gap-3 focus-within:border-indigo-500 transition-all"
      >
        <div className="pl-3 text-indigo-400 flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold hidden sm:inline">Ask UniPilot:</span>
        </div>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder='Ask anything... e.g. "Can I bunk DBMS today?" or "Summarize OS notes"'
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white hover:opacity-90 transition-opacity shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Today's Schedule Strip (Horizontal scroll on mobile, cards row on desktop) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="section-heading">Today&apos;s Class Schedule</h2>
          </div>
          <button 
            onClick={() => navigate('/timetable')}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Full Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {todayClasses.map((cls) => (
            <div
              key={cls.id}
              className={`min-w-[250px] sm:flex-1 p-5 rounded-2xl border transition-all ${
                cls.status === 'current'
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-glow-primary'
                  : cls.status === 'completed'
                    ? 'bg-darkCard/40 border-darkBorder/60 opacity-60'
                    : 'bg-darkCard/80 border-darkBorder hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">{cls.time}</span>
                {cls.status === 'current' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold animate-pulse">
                    LIVE NOW
                  </span>
                )}
                {cls.status === 'completed' && (
                  <span className="text-slate-500 text-xs flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Attended
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white truncate">{cls.name}</h3>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>{cls.room}</span>
                <span>{cls.prof}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Diagram: Weekly Academic Velocity & Focus Breakdown */}
      <WeeklyWorkloadChart />

      {/* Visual Diagram: Attendance vs 75% Statutory Cutoff Chart */}
      <AttendanceThresholdChart
        attendance={activeAttendance}
        onSelectSubject={(id) => {
          if (canEditAttendance) {
            const s = activeAttendance.find(x => x.id === id);
            if (s) {
              setEditingSub(s);
              setEditAttended(s.attended);
              setEditHeld(s.held);
              setAdminModalOpen(true);
            }
          }
        }}
      />

      {/* 2-Column Responsive Layout: Left (Daily Digest + Deadlines), Right (Attendance Summary + Copilot Quick Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* &ldquo;What to do today&rdquo; Digest Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-darkCard to-indigo-950/30 border border-darkBorder/90 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-darkBorder/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Daily Focus Digest</h3>
                  <p className="text-xs text-slate-400">Auto-prioritized by exam proximity & attendance risk</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                3 Actions
              </span>
            </div>

            <div className="divide-y divide-darkBorder/50 mt-3">
              <div className="py-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">DBMS Class attendance mandatory</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      You are at 71.4% (Threshold: 75%). Missing today drops you to 68.9% (Critical Risk).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/attendance')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 shrink-0"
                >
                  Inspect
                </button>
              </div>

              <div className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Raft Consensus Lab due tomorrow</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Need 2 more hours to complete log compaction benchmarks.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/notes')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0"
                >
                  Notes & Doubts
                </button>
              </div>

              <div className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Generated Study Block: Deep Learning Flashcards</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      15 cards due for spaced-repetition review ahead of Midterm II.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/notes')}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 shrink-0"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines & Tasks */}
          <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">Upcoming Coursework & Deadlines</h3>
              </div>
              <button 
                onClick={() => navigate('/timetable')}
                className="text-xs text-indigo-400 hover:underline"
              >
                View all tasks
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-darkBg/60 border border-darkBorder/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleAssignmentStatus(item.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.status === 'Submitted'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {item.status === 'Submitted' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <h4 className={`text-sm font-semibold truncate ${item.status === 'Submitted' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{item.subject} • Due: {item.dueDate}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.priority === 'Urgent' 
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Attendance Summary Widget with Color-Coded Risk (Feature #3 & #6) */}
          <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Attendance Risk Radar</h3>
              </div>
              <button
                onClick={() => navigate('/attendance')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <span>Calculator</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-5">
              {activeAttendance.map((sub) => {
                const pct = Math.round((sub.attended / sub.held) * 100);
                const isCritical = pct < sub.required;
                const isWarning = pct >= sub.required && pct < sub.required + 5;
                const isSafe = pct >= sub.required + 5;

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-sm text-slate-200 truncate max-w-[180px]">
                        {sub.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-mono">
                          {sub.attended}/{sub.held}
                        </span>
                        <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                          isCritical 
                            ? 'text-rose-400 bg-rose-500/15'
                            : isWarning 
                              ? 'text-amber-400 bg-amber-500/15'
                              : 'text-emerald-400 bg-emerald-500/15'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Compact progress bar */}
                    <div className="h-2 w-full bg-darkBg rounded-full overflow-hidden p-[1px] border border-darkBorder/80">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical 
                            ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                            : isWarning 
                              ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
                              : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-darkBorder/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Safe (&gt;80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Warning (75-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Risk (&lt;75%)
              </span>
            </div>
          </div>

          {/* Quick Career Pipeline Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-darkCard to-darkCard border border-indigo-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Living Career Profile</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Auto-Synced
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Your resume and portfolio are dynamically compiled from {activities.length} verified experiences in your activity feed.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/resume')}
                className="p-4 rounded-2xl bg-darkBg/80 border border-darkBorder/80 hover:border-indigo-500/50 flex flex-col items-start gap-1.5 transition-all group"
              >
                <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-300">Master Resume</span>
                <span className="text-sm font-bold text-white flex items-center gap-1">
                  ATS Ready <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => navigate('/portfolio')}
                className="p-3 rounded-2xl bg-darkBg/80 border border-darkBorder/80 hover:border-indigo-500/50 flex flex-col items-start gap-1 transition-all group"
              >
                <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-300">Web Portfolio</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  Live Preview <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* AI Quiz Results Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/30 via-darkCard to-darkCard border border-violet-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">AI Quiz Results</h3>
              </div>
              <button
                onClick={() => navigate('/notes')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
              >
                <span>Take Quiz</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {quizResults && quizResults.length > 0 ? (
              <div className="space-y-3">
                {quizResults.slice(0, 4).map((result) => {
                  const pct = result.percentage;
                  const color = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400';
                  const bg = pct >= 80 ? 'bg-emerald-500/10' : pct >= 60 ? 'bg-amber-500/10' : 'bg-rose-500/10';
                  const border = pct >= 80 ? 'border-emerald-500/20' : pct >= 60 ? 'border-amber-500/20' : 'border-rose-500/20';
                  return (
                    <div key={result.id} className={`flex items-center justify-between p-3 rounded-xl ${bg} border ${border}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{result.docTitle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{result.completedAt}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Trophy className={`w-3.5 h-3.5 ${color}`} />
                        <span className={`text-sm font-bold font-mono ${color}`}>{pct}%</span>
                        <span className="text-[10px] text-slate-500">{result.score}/{result.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <Brain className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500">No quiz results yet.</p>
                <button
                  onClick={() => navigate('/notes')}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline"
                >
                  Generate an AI quiz from your notes →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Career GPS & Portfolio Gap Advisor */}
      <CareerAdvisorWidget />

      {/* Admin Attendance Management Modal */}

      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-violet-500/30 bg-slate-900 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold">Admin Attendance Management</h3>
              </div>
              <button
                onClick={() => { setAdminModalOpen(false); setEditingSub(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Record or overwrite attendance for <strong>{activeUser.name}</strong>. Only administrators can perform this action.
            </p>

            {editingSub ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await adminSetAttendance(activeUser.id, editingSub.id, Number(editAttended), Number(editHeld), editingSub.required || 75);
                setEditingSub(null);
                setAdminModalOpen(false);
              }} className="space-y-4">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Selected Subject</span>
                  <p className="text-sm font-bold text-white mt-0.5">{editingSub.name} ({editingSub.code})</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Classes Attended</label>
                    <input
                      type="number"
                      min="0"
                      value={editAttended}
                      onChange={(e) => setEditAttended(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Classes Held</label>
                    <input
                      type="number"
                      min="1"
                      value={editHeld}
                      onChange={(e) => setEditHeld(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-center justify-between">
                  <span>Calculated Percentage:</span>
                  <span className="font-mono font-bold text-sm">
                    {editHeld > 0 ? Math.round((Number(editAttended) / Number(editHeld)) * 100) : 0}%
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg"
                  >
                    Save Attendance Values
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSub(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Back to List
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeAttendance.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{sub.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {sub.attended}/{sub.held} classes • <span className="text-violet-300 font-bold">{Math.round((sub.attended / sub.held) * 100)}%</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={async () => {
                          await adminUpdateAttendance(activeUser.id, sub.id, 1, 1);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold"
                        title="Mark Present (+1 attended, +1 held)"
                      >
                        + Present
                      </button>
                      <button
                        onClick={async () => {
                          await adminUpdateAttendance(activeUser.id, sub.id, 0, 1);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold"
                        title="Mark Absent (+0 attended, +1 held)"
                      >
                        + Absent
                      </button>
                      <button
                        onClick={() => {
                          setEditingSub(sub);
                          setEditAttended(sub.attended);
                          setEditHeld(sub.held);
                        }}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                        title="Edit exact numbers"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}