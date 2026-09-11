import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  UploadCloud, 
  CheckCircle2, 
  Check, 
  Edit3, 
  BookOpen, 
  Layers,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Timetable() {
  const { assignments, toggleAssignmentStatus, timetable, setTimetable, attendance, user } = useApp();
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' | 'assignments'
  const [activeDay, setActiveDay] = useState('Monday');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Timetable weekly data — uses user-specific timetable from context, or derives from active subjects
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hasClasses = timetable && Object.values(timetable).some(arr => arr && arr.length > 0);
  
  const activeTimetable = hasClasses ? timetable : (attendance && attendance.length > 0 ? {
    Monday: attendance.slice(0, 2).map((s, i) => ({ id: i + 1, time: i === 0 ? '09:00 - 10:15 AM' : '10:30 - 11:45 AM', code: s.code, name: s.name, room: 'Hall 201', prof: s.faculty || 'Faculty Lead' })),
    Tuesday: attendance.slice(2, 4).map((s, i) => ({ id: i + 3, time: i === 0 ? '09:30 - 11:00 AM' : '01:00 - 02:30 PM', code: s.code, name: s.name, room: 'Lab 3B', prof: s.faculty || 'Faculty Lead' })),
    Wednesday: attendance.slice(0, 2).map((s, i) => ({ id: i + 5, time: i === 0 ? '09:00 - 10:15 AM' : '01:30 - 02:45 PM', code: s.code, name: s.name, room: 'Hall 108', prof: s.faculty || 'Faculty Lead' })),
    Thursday: attendance.slice(1, 3).map((s, i) => ({ id: i + 7, time: i === 0 ? '10:00 - 11:30 AM' : '02:00 - 03:30 PM', code: s.code, name: s.name, room: 'Hall 201', prof: s.faculty || 'Faculty Lead' })),
    Friday: attendance.slice(0, 3).map((s, i) => ({ id: i + 9, time: i === 0 ? '09:00 - 10:15 AM' : (i === 1 ? '11:00 - 12:30 PM' : '02:00 - 03:30 PM'), code: s.code, name: s.name, room: 'Auditorium', prof: s.faculty || 'Faculty Lead' })),
  } : {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  });

  // Modal new class form
  const [newClass, setNewClass] = useState({
    day: 'Monday',
    time: '09:00 - 10:00 AM',
    code: '',
    name: '',
    room: '',
    prof: ''
  });

  const handleAddClassSubmit = (e) => {
    e.preventDefault();
    if (!newClass.name) return;
    const dayClasses = activeTimetable[newClass.day] || [];
    const updated = {
      ...activeTimetable,
      [newClass.day]: [...dayClasses, { ...newClass, id: Date.now() }]
    };
    if (setTimetable) setTimetable(updated);
    const storageKey = user.id === 'local-student' ? 'unipilot_local_timetable' : `unipilot_timetable_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowAddClassModal(false);
    setNewClass({ day: 'Monday', time: '09:00 - 10:00 AM', code: '', name: '', room: '', prof: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Switcher Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Timetable & Coursework
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official class schedule and assignments source-of-truth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-darkCard border border-darkBorder p-1">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'timetable' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Timetable
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assignments ({assignments.length})
            </button>
          </div>

          {activeTab === 'timetable' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-darkCard border border-darkBorder text-slate-300 hover:text-white text-xs font-semibold"
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Import Schedule</span>
              </button>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-primary"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddAssignmentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Day-by-Day Selector for Mobile View */}
          <div className="lg:hidden flex items-center justify-between bg-darkCard/80 border border-darkBorder p-2 rounded-2xl">
            <div className="flex gap-1 overflow-x-auto w-full">
              {days.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                    activeDay === d ? 'bg-indigo-600 text-white shadow-glow-primary' : 'text-slate-400 hover:bg-darkBg'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop 5-Column Grid */}
          <div className="hidden lg:grid grid-cols-5 gap-3">
            {days.map((day) => (
              <div key={day} className="p-3 rounded-2xl bg-darkCard/70 border border-darkBorder flex flex-col gap-2 min-h-[420px]">
                <div className="pb-2 border-b border-darkBorder flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{day}</span>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono">
                    {activeTimetable[day]?.length || 0} slots
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {activeTimetable[day]?.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-darkBg border border-darkBorder/80 hover:border-indigo-500/50 transition-all space-y-1 group"
                    >
                      <span className="text-[10px] font-mono text-indigo-300 font-semibold block">
                        {slot.time}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-snug">{slot.name}</h4>
                      <p className="text-[11px] text-slate-400">{slot.code} • {slot.room}</p>
                      <span className="text-[10px] text-slate-500 block">{slot.prof}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Single Day Card Stack */}
          <div className="lg:hidden space-y-3">
            <h3 className="text-sm font-bold text-white px-1">{activeDay}&apos;s Lectures</h3>
            <div className="space-y-2.5">
              {activeTimetable[activeDay]?.map((slot) => (
                <div key={slot.id} className="p-4 rounded-2xl bg-darkCard border border-darkBorder space-y-1.5">
                  <span className="text-xs font-mono text-indigo-400 font-bold">{slot.time}</span>
                  <h4 className="text-sm font-bold text-white">{slot.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>{slot.code} ({slot.room})</span>
                    <span>{slot.prof}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-darkBorder text-xs text-slate-400">
            <span>Coursework deadlines & laboratory reports</span>
            <span>{assignments.filter(a => a.status === 'Submitted').length} of {assignments.length} submitted</span>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl bg-darkBg/70 border border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAssignmentStatus(asg.id)}
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                      asg.status === 'Submitted'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {asg.status === 'Submitted' && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <h4 className={`text-sm font-bold ${asg.status === 'Submitted' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {asg.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {asg.subject} • Due: <strong className="text-slate-300">{asg.dueDate}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    asg.status === 'Submitted'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : asg.status === 'In progress'
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-300'
                  }`}>
                    {asg.status}
                  </span>

                  <button
                    onClick={() => toggleAssignmentStatus(asg.id)}
                    className="px-3 py-1 rounded-lg bg-darkBg border border-darkBorder hover:border-indigo-500 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    {asg.status === 'Submitted' ? 'Mark Incomplete' : 'Mark Submitted'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddClassModal(false)}
        >
          <div 
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Class Slot</h3>
              <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClassSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Weekday</label>
                <select
                  value={newClass.day}
                  onChange={(e) => setNewClass({ ...newClass, day: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="CS 301"
                    value={newClass.code}
                    onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    placeholder="Hall 402"
                    value={newClass.room}
                    onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Time Range</label>
                <input
                  type="text"
                  placeholder="09:00 - 10:15 AM"
                  value={newClass.time}
                  onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-primary"
              >
                Save Class to Timetable
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImportModal(false)}
        >
          <div 
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Import Timetable (AI Optical Parser)</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-darkBorder rounded-2xl p-6 text-center bg-darkBg cursor-pointer">
              <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">Upload screenshot or university timetable PDF</p>
              <p className="text-[11px] text-slate-500 mt-1">Our vision model extracts slots and syncs with attendance radar</p>
            </div>

            <button
              onClick={() => setShowImportModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Confirm Auto-Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
