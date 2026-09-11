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
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklyWorkloadChart } from '../components/VisualCharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    user, 
    attendance, 
    assignments, 
    toggleAssignmentStatus, 
    setQuickAddOpen,
    activities,
    portalRole,
    SAMPLE_STUDENTS,
    selectStudent
  } = useApp();

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
      {/* Guardian / Faculty Inspection Banner */}
      {portalRole === 'guardian' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Parent / Faculty Monitor Mode</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-[10px] font-semibold border border-purple-500/30">
                  Full Dashboard Access
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Viewing academic dashboard of student: <strong className="text-white">{user.name}</strong> ({user.rollNo || 'Enrolled'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Switch Ward:</span>
            <select
              value={user.id}
              onChange={(e) => selectStudent(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-darkBg border border-purple-500/40 text-xs font-semibold text-white focus:outline-none focus:border-purple-400"
            >
              {SAMPLE_STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.course.split(' ')[0]} • {s.attendancePct}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Header Welcome & Quick Copilot Input Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good morning, {user.name.split(' ')[0]}
            </h1>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            {user.course} • {user.semester} • 4 classes scheduled today
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
              {attendance.map((sub) => {
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
        </div>
      </div>
    </div>
  );
}
