import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StudyDistributionChart } from '../components/VisualCharts';

export default function Planner() {
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [calendarSpan, setCalendarSpan] = useState('week'); // 'week' | 'month'
  const [isGenerating, setIsGenerating] = useState(false);

  const [studyPlan, setStudyPlan] = useState([
    {
      id: 'plan-1',
      title: 'Distributed Systems: Raft Leader Election State Machine',
      type: 'Study Block',
      subject: 'CS 301',
      date: 'Today, 4:00 PM - 5:30 PM',
      day: 'Mon',
      priority: 'Urgent',
      completed: false,
      reason: 'Midterm scheduled in 6 days'
    },
    {
      id: 'plan-2',
      title: 'DBMS: B+ Tree Range Queries & Page Splitting implementation',
      type: 'Assignment',
      subject: 'CS 305',
      date: 'Tomorrow, 2:00 PM - 4:00 PM',
      day: 'Tue',
      priority: 'Urgent',
      completed: false,
      reason: 'Homework 3 due Thursday'
    },
    {
      id: 'plan-3',
      title: 'AI: Review Attention Mechanism & Multi-Head Projections',
      type: 'Flashcards',
      subject: 'CS 312',
      date: 'Wednesday, 6:00 PM - 7:00 PM',
      day: 'Wed',
      priority: 'This Week',
      completed: true,
      reason: 'Spaced repetition cadence'
    },
    {
      id: 'plan-4',
      title: 'Computer Networks: TCP Tahoe vs Reno Congestion Window analysis',
      type: 'Study Block',
      subject: 'CS 318',
      date: 'Thursday, 3:00 PM - 5:00 PM',
      day: 'Thu',
      priority: 'This Week',
      completed: false,
      reason: 'Lab evaluation'
    },
    {
      id: 'plan-5',
      title: 'Midterm II: Distributed Operating Systems',
      type: 'Exam',
      subject: 'CS 301',
      date: 'Friday, 10:00 AM - 12:00 PM',
      day: 'Fri',
      priority: 'Urgent',
      completed: false,
      reason: 'Official Examination'
    },
    {
      id: 'plan-6',
      title: 'Hackathon Submission Polish & Demo recording',
      type: 'Extracurricular',
      subject: 'HackMIT',
      date: 'Saturday, 11:00 AM',
      day: 'Sat',
      priority: 'Later',
      completed: false,
      reason: 'Resume sync milestone'
    }
  ]);

  const toggleTask = (id) => {
    setStudyPlan(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // add an extra optimized study block
      const newBlock = {
        id: `plan-${Date.now()}`,
        title: 'AI Notes Recap: Transformer Positional Encodings',
        type: 'Study Block',
        subject: 'CS 312',
        date: 'Sunday, 10:00 AM - 11:30 AM',
        day: 'Sun',
        priority: 'This Week',
        completed: false,
        reason: 'Recalculated from latest quiz results'
      };
      setStudyPlan([...studyPlan, newBlock]);
    }, 1000);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Smart Academic Planner</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic study blocks synthesized from upcoming exams, assignment deadlines, and quiz weaknesses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Calendar vs List toggle */}
          <div className="flex rounded-xl bg-darkCard border border-darkBorder p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-primary transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Recalculating Plan...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Visual Diagram: Study Focus & Task Completion Distribution */}
      <StudyDistributionChart studyPlan={studyPlan} />

      {/* Week / Month Toggle if in Calendar mode */}
      {viewMode === 'calendar' && (
        <div className="flex items-center justify-between bg-darkCard/60 border border-darkBorder p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg bg-darkBg text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-white">October 14 – October 20, 2024</span>
            <button className="p-1.5 rounded-lg bg-darkBg text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCalendarSpan('week')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                calendarSpan === 'week' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setCalendarSpan('month')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                calendarSpan === 'month' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400'
              }`}
            >
              Month View
            </button>
          </div>
        </div>
      )}

      {/* Calendar View (Desktop grid / Day lanes) */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {daysOfWeek.map((day) => {
            const dayItems = studyPlan.filter(p => p.day === day);
            return (
              <div 
                key={day} 
                className="min-h-[280px] p-3 rounded-2xl bg-darkCard/70 border border-darkBorder flex flex-col gap-2"
              >
                <div className="pb-2 border-b border-darkBorder flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">{day}</span>
                  <span className="text-[10px] text-slate-500">{dayItems.length} blocks</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-600">
                      No study blocks
                    </div>
                  ) : (
                    dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleTask(item.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          item.completed 
                            ? 'bg-darkBg/40 border-darkBorder opacity-50' 
                            : item.type === 'Exam'
                              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                              : 'bg-darkBg border-darkBorder/80 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            item.type === 'Exam' ? 'bg-rose-500/30 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'
                          }`}>
                            {item.completed && <CheckCircle2 className="w-3 h-3" />}
                          </span>
                        </div>
                        <h4 className={`text-xs font-semibold line-clamp-2 ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-1">{item.date.split(',')[1]}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Ideal for mobile or consolidated task checklist) */
        <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-darkBorder text-xs text-slate-400">
            <span>Click any block to mark complete or review reason</span>
            <span>{studyPlan.filter(p => p.completed).length} of {studyPlan.length} completed</span>
          </div>

          <div className="space-y-2.5">
            {studyPlan.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-darkBg/60 border border-darkBorder flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleTask(item.id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      item.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {item.subject} • {item.date} • <span className="text-indigo-400">Reason: {item.reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.priority === 'Urgent'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : item.priority === 'This Week'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
