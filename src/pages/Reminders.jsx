import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Reminders() {
  const { notifications } = useApp();
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [activeReminders, setActiveReminders] = useState([
    {
      id: 'rem-1',
      title: 'DBMS Attendance Defense',
      desc: 'Critical alert: 1 class missed leads to instant exam debarment warning.',
      type: 'critical',
      target: 'Tomorrow at 10:30 AM',
      channel: 'Desktop Push + Top Banner'
    },
    {
      id: 'rem-2',
      title: 'Raft Consensus Lab Benchmark Submission',
      desc: 'Ensure all 50 concurrent goroutine tests pass before git commit.',
      type: 'deadline',
      target: 'Tomorrow at 11:59 PM',
      channel: 'Desktop Push'
    },
    {
      id: 'rem-3',
      title: 'Midterm II: Distributed Systems',
      desc: 'Covers Paxos, Raft, Two-Phase Commit, and Vector Clocks.',
      type: 'exam',
      target: 'In 5 days',
      channel: 'Countdown Timer'
    },
    {
      id: 'rem-4',
      title: 'HackMIT Grand Prize Demo video upload',
      desc: 'Record 2-minute Loom walkthrough for living resume showcase.',
      type: 'general',
      target: 'Sunday at 5:00 PM',
      channel: 'Desktop Push'
    }
  ]);

  const [newReminder, setNewReminder] = useState({
    title: '',
    desc: '',
    target: '',
    type: 'deadline'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newReminder.title) return;
    setActiveReminders([
      ...activeReminders,
      {
        ...newReminder,
        id: `rem-${Date.now()}`,
        channel: 'Desktop Push'
      }
    ]);
    setShowAddModal(false);
    setNewReminder({ title: '', desc: '', target: '', type: 'deadline' });
  };

  const removeReminder = (id) => {
    setActiveReminders(activeReminders.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reminders & Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralized intelligent nudges for attendance risk, coursework deadlines, and exam countdowns.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Reminder</span>
        </button>
      </div>

      {/* Global Preference Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-darkCard border border-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Desktop Notifications</h4>
              <p className="text-[11px] text-slate-400">Push high-priority nudges when tab is inactive</p>
            </div>
          </div>
          <button
            onClick={() => setDesktopEnabled(!desktopEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              desktopEnabled ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              desktopEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-darkCard border border-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Audio Chime Alerts</h4>
              <p className="text-[11px] text-slate-400">Play subtle sound on deadline countdowns</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              soundEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Active Reminders List */}
      <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Active Reminders ({activeReminders.length})
        </h3>

        <div className="space-y-3">
          {activeReminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 rounded-2xl bg-darkBg/70 border border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                  rem.type === 'critical'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : rem.type === 'exam'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{rem.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{rem.desc}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {rem.target}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{rem.channel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => removeReminder(rem.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Dismiss Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Custom Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turn in Operating Systems take-home"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or submission instructions"
                  value={newReminder.desc}
                  onChange={(e) => setNewReminder({ ...newReminder, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g. Friday at 3:00 PM"
                  value={newReminder.target}
                  onChange={(e) => setNewReminder({ ...newReminder, target: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-primary"
              >
                Create Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
