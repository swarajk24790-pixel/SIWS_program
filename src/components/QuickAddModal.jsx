import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  CheckSquare, 
  Bell, 
  CheckCircle2, 
  Trophy,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QuickAddModal() {
  const navigate = useNavigate();
  const { quickAddOpen, setQuickAddOpen, setQuickAddDefaultType } = useApp();

  if (!quickAddOpen) return null;

  const actions = [
    {
      id: 'achievement',
      title: 'Add Achievement / Experience',
      desc: 'Log a hackathon win, internship, online course, or leadership role for your living resume.',
      icon: Trophy,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      action: () => {
        setQuickAddOpen(false);
        navigate('/add-achievement');
      }
    },
    {
      id: 'import',
      title: 'Import Certificate / GitHub',
      desc: 'Auto-extract details from certificate PDFs or sync top GitHub repositories.',
      icon: Award,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      action: () => {
        setQuickAddOpen(false);
        navigate('/import');
      }
    },
    {
      id: 'task',
      title: 'Add Task / Assignment',
      desc: 'Track academic deadlines, lab reports, or project milestones.',
      icon: CheckSquare,
      color: 'from-blue-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
      action: () => {
        setQuickAddOpen(false);
        navigate('/timetable');
      }
    },
    {
      id: 'attendance',
      title: 'Log Today\'s Attendance',
      desc: 'Quick present/absent tap to update real-time detention risk metrics.',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        setQuickAddOpen(false);
        navigate('/attendance');
      }
    },
    {
      id: 'reminder',
      title: 'Add Custom Reminder',
      desc: 'Get smart push nudges before crucial exams or project presentations.',
      icon: Bell,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
      action: () => {
        setQuickAddOpen(false);
        navigate('/reminders');
      }
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setQuickAddOpen(false)}
    >
      <div 
        className="w-full max-w-lg bg-darkCard border border-darkBorder rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setQuickAddOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Quick Action Hub</h3>
            <p className="text-xs text-slate-400">What would you like to log or schedule right now?</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.action}
                className="w-full flex items-start gap-4 p-3.5 rounded-2xl bg-darkBg/60 border border-darkBorder/80 hover:bg-darkCardHover hover:border-slate-700 transition-all text-left group"
              >
                <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${act.color} shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
