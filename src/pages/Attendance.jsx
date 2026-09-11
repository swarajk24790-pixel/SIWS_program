import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Calculator, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  Check, 
  Plus, 
  Minus,
  Sparkles,
  Info,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceThresholdChart, AttendanceTrendChart } from '../components/VisualCharts';

export default function Attendance() {
  const { 
    attendance, 
    updateAttendance, 
    isAdmin, 
    adminViewingStudent, 
    clearAdminViewingStudent, 
    adminUpdateAttendance 
  } = useApp();

  const canEditAttendance = isAdmin || !!adminViewingStudent;

  // Selected subject for What-if Calculator
  const [selectedSubjectId, setSelectedSubjectId] = useState(attendance[0]?.id || 'cs301');
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkDays, setBulkDays] = useState(5);

  const activeSubject = attendance.find(s => s.id === selectedSubjectId) || attendance[0];

  // Deterministic math calculation:
  // Let A = attended, H = held, T = target% / 100
  // To reach T (when A/H < T):
  // (A + x) / (H + x) >= T => A + x >= T*H + T*x => x(1 - T) >= T*H - A => x = ceil((T*H - A) / (1 - T))
  // To stay above T (when A/H >= T, how many can bunk?):
  // A / (H + y) >= T => A >= T*H + T*y => T*y <= A - T*H => y = floor((A - T*H) / T)
  const currentPct = activeSubject ? (activeSubject.attended / activeSubject.held) * 100 : 0;
  const T = targetPercentage / 100;
  let whatIfResult = { type: 'exact', message: '' };

  if (activeSubject) {
    if (Math.round(currentPct) === targetPercentage) {
      whatIfResult = {
        type: 'exact',
        message: `You are exactly at your ${targetPercentage}% target. Maintain 1-for-1 attendance to stay on track.`
      };
    } else if (currentPct < targetPercentage) {
      const classesNeeded = Math.ceil((T * activeSubject.held - activeSubject.attended) / (1 - T));
      whatIfResult = {
        type: 'attend',
        count: Math.max(1, classesNeeded),
        message: `You need to attend the next ${Math.max(1, classesNeeded)} consecutive classes without missing to reach ${targetPercentage}%.`
      };
    } else {
      const canMiss = Math.floor((activeSubject.attended - T * activeSubject.held) / T);
      whatIfResult = {
        type: 'bunk',
        count: Math.max(0, canMiss),
        message: canMiss > 0 
          ? `You can safely miss up to ${canMiss} classes while remaining at or above ${targetPercentage}%.`
          : `You cannot miss any classes without dropping below ${targetPercentage}%.`
      };
    }
  }

  const handleBulkMark = (status) => {
    // apply bulk days
    if (status === 'present') {
      updateAttendance(selectedSubjectId, bulkDays, bulkDays);
    } else {
      updateAttendance(selectedSubjectId, 0, bulkDays);
    }
    setBulkModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Attendance Analyzer</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic, formula-backed tracking with zero guesswork. Protect yourself from exam debarment.
          </p>
        </div>

        {canEditAttendance ? (
          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg transition-all self-start sm:self-auto"
          >
            <Calendar className="w-4 h-4" />
            <span>Mark Bulk Attendance (Admin)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Student View: View-Only</span>
          </div>
        )}
      </div>

      {/* View-Only Student Notice or Admin Active Notice */}
      {!canEditAttendance ? (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Student View-Only Mode:</strong> Only administrators and faculty can add or record attendance. You can use the What-If Calculator below to model safe absences or recovery targets.
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
            STATUTORY 75%
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-xs text-violet-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
            <span>
              <strong>Admin Mode Active:</strong> You have permissions to record present/absent classes and modify attendance for this student.
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold">
            ADMINISTRATOR
          </span>
        </div>
      )}


      {/* Visual Diagram: Attendance vs 75% Cutoff Line Chart */}
      <AttendanceThresholdChart
        attendance={attendance}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={(id) => setSelectedSubjectId(id)}
      />

      {/* Main Grid: Subject Table (7 cols) + What-if Calculator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subject List & Real-Time Logging (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Current Course Roster</span>
              <span className="text-[11px] font-normal text-slate-400">Quick Log Today&apos;s Class</span>
            </h3>

            <div className="space-y-3">
              {attendance.map((sub) => {
                const pct = Math.round((sub.attended / sub.held) * 100);
                const isCritical = pct < sub.required;
                const isWarning = pct >= sub.required && pct < sub.required + 5;
                const isSelected = selectedSubjectId === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-950/30 border-indigo-500/60 shadow-glow-primary' 
                        : 'bg-darkBg/60 border-darkBorder/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sub.name}</span>
                          <span className="text-xs text-slate-400 font-mono">({sub.code})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Held: <strong className="text-slate-200">{sub.held}</strong> • Attended: <strong className="text-slate-200">{sub.attended}</strong> • Required: <strong className="text-indigo-300">{sub.required}%</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-extrabold font-mono px-2.5 py-1 rounded-xl ${
                          isCritical 
                            ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30' 
                            : isWarning 
                              ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' 
                              : 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with Safety zones */}
                    <div className="h-2.5 w-full bg-darkBg rounded-full overflow-hidden p-[1px] border border-darkBorder mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical 
                            ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' 
                            : isWarning 
                              ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' 
                              : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    {/* Quick Log Buttons (Admin only) or View Status (Student) */}
                    <div className="flex items-center justify-between pt-2 border-t border-darkBorder/50 text-xs">
                      <span className="text-[11px] text-slate-500">
                        {isSelected ? '✓ Loaded in Calculator' : 'Click to load in calculator'}
                      </span>

                      {canEditAttendance ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAttendance(sub.id, 1, 1);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present (+1)
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAttendance(sub.id, 0, 1);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500/70" /> View-Only (Admin Managed)
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: What-if Calculator Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-darkCard/90 border border-darkBorder shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-darkBorder">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">What-If Calculator</h3>
                <p className="text-[11px] text-slate-400">Model absence tolerance & recovery targets</p>
              </div>
            </div>

            {activeSubject ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-darkBg border border-darkBorder">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analyzing Subject</span>
                  <p className="text-sm font-bold text-white mt-0.5">{activeSubject.name}</p>
                  <p className="text-xs text-slate-400">
                    Current: <span className="font-mono text-white font-bold">{Math.round((activeSubject.attended / activeSubject.held) * 100)}%</span> ({activeSubject.attended}/{activeSubject.held} classes)
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span>Target Attendance Goal</span>
                    <span className="font-bold text-indigo-400 font-mono text-sm">{targetPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="1"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-darkBg rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>50%</span>
                    <span>75% (Standard)</span>
                    <span>85% (Honors)</span>
                    <span>95%</span>
                  </div>
                </div>

                {/* Calculation Result Banner */}
                <div className={`p-4 rounded-2xl border ${
                  whatIfResult.type === 'bunk' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : whatIfResult.type === 'attend' 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-xs">
                    {whatIfResult.type === 'bunk' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {whatIfResult.type === 'attend' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {whatIfResult.type === 'exact' && <Info className="w-4 h-4 text-indigo-400" />}
                    <span>Deterministic Result</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {whatIfResult.message}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-semibold text-slate-300">University Attendance Bylaw:</p>
                  <p>Students dropping below 75% are automatically barred from end-term examinations without prior medical certificate clearance.</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a subject from the list to begin calculation.</p>
            )}
          </div>

          {/* 6-Week Trajectory Trendline Diagram */}
          <AttendanceTrendChart />
        </div>
      </div>

      {/* Bulk Attendance Modal */}
      {bulkModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setBulkModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Mark Bulk Attendance</h3>
            <p className="text-xs text-slate-400">
              Retroactively log full attendance for past weeks (e.g. during festivals, placement drives, or holidays).
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <select 
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
              >
                {attendance.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Number of Classes / Days</label>
              <input 
                type="number"
                min="1"
                max="30"
                value={bulkDays}
                onChange={(e) => setBulkDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleBulkMark('present')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Mark All Present (+{bulkDays})
              </button>
              <button
                onClick={() => handleBulkMark('absent')}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
