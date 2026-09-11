import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck, Clock, BarChart3, Activity } from 'lucide-react';

/**
 * AttendanceThresholdChart
 * Visual diagrammatic bar chart comparing all enrolled subjects against the 75% statutory threshold line.
 * Pure SVG + Tailwind: 0 external credits used, responsive, crisp.
 */
export function AttendanceThresholdChart({ attendance, selectedSubjectId, onSelectSubject }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const subjects = attendance.map((s) => {
    const pct = Math.round((s.attended / s.held) * 100);
    return {
      ...s,
      pct,
      isCritical: pct < s.required,
      isWarning: pct >= s.required && pct < s.required + 5,
      isSafe: pct >= s.required + 5,
    };
  });

  const chartHeight = 160;
  const chartWidth = 500;
  const barWidth = 44;
  const gap = (chartWidth - subjects.length * barWidth) / (subjects.length + 1);
  const thresholdY = chartHeight - (75 / 100) * chartHeight;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-darkCard/90 border border-darkBorder shadow-xl relative overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-darkBorder/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Attendance vs. 75% Threshold Diagram</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Live Data
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visual benchmark against university exam clearance cutoff
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Safe (≥80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Warning (75-79%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Danger (&lt;75%)</span>
          </span>
        </div>
      </div>

      {/* SVG Bar Chart with 75% Threshold Line */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full h-44 sm:h-52 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="barSafe" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="barWarning" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="barDanger" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>

          {/* Grid lines (25%, 50%, 75%, 100%) */}
          {[25, 50, 75, 100].map((level) => {
            const y = chartHeight - (level / 100) * chartHeight;
            const is75 = level === 75;
            return (
              <g key={level}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={is75 ? '#f43f5e' : '#334155'}
                  strokeWidth={is75 ? '1.5' : '0.75'}
                  strokeDasharray={is75 ? '4 4' : '2 2'}
                  opacity={is75 ? '0.85' : '0.4'}
                />
                <text
                  x={chartWidth - 4}
                  y={y - 4}
                  textAnchor="end"
                  fill={is75 ? '#f43f5e' : '#64748b'}
                  fontSize="10"
                  fontWeight={is75 ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {level}% {is75 && '★ CUTOFF'}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {subjects.map((sub, idx) => {
            const x = gap + idx * (barWidth + gap);
            const clampedPct = Math.min(100, Math.max(0, sub.pct));
            const barH = (clampedPct / 100) * chartHeight;
            const y = chartHeight - barH;
            const isSelected = selectedSubjectId === sub.id;
            const isHovered = hoveredIndex === idx;

            let fill = 'url(#barSafe)';
            let stroke = '#10b981';
            if (sub.isCritical) {
              fill = 'url(#barDanger)';
              stroke = '#f43f5e';
            } else if (sub.isWarning) {
              fill = 'url(#barWarning)';
              stroke = '#f59e0b';
            }

            return (
              <g
                key={sub.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectSubject && onSelectSubject(sub.id)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow pill when selected / hovered */}
                {(isSelected || isHovered) && (
                  <rect
                    x={x - 4}
                    y={y - 4}
                    width={barWidth + 8}
                    height={barH + 8}
                    rx="10"
                    fill="none"
                    stroke={stroke}
                    strokeWidth="2"
                    opacity="0.9"
                  />
                )}

                {/* Main Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(4, barH)}
                  rx="6"
                  fill={fill}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-300"
                />

                {/* Percentage text above bar */}
                <text
                  x={x + barWidth / 2}
                  y={Math.max(14, y - 6)}
                  textAnchor="middle"
                  fill={sub.isCritical ? '#fda4af' : sub.isWarning ? '#fde68a' : '#a7f3d0'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {sub.pct}%
                </text>

                {/* Subject Code below baseline */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#818cf8' : '#cbd5e1'}
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : '600'}
                >
                  {sub.code}
                </text>

                {/* Attended / Held count */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 29}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {sub.attended}/{sub.held}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-darkBorder/40">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any bar to instantly model attendance in the What-If Calculator</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Target Threshold: <strong>75.0%</strong>
        </span>
      </div>
    </div>
  );
}

/**
 * AttendanceTrendChart
 * 6-Week semester attendance trajectory area curve.
 */
export function AttendanceTrendChart() {
  const weeks = [
    { week: 'W1', pct: 92, held: 12, attended: 11 },
    { week: 'W2', pct: 86, held: 24, attended: 21 },
    { week: 'W3', pct: 81, held: 36, attended: 29 },
    { week: 'W4', pct: 77, held: 48, attended: 37 },
    { week: 'W5', pct: 73, held: 60, attended: 44 },
    { week: 'W6', pct: 78, held: 72, attended: 56 },
  ];

  const w = 420;
  const h = 130;
  const paddingX = 35;
  const paddingY = 20;

  const points = weeks.map((item, i) => {
    const x = paddingX + (i / (weeks.length - 1)) * (w - 2 * paddingX);
    const y = paddingY + ((100 - item.pct) / 40) * (h - 2 * paddingY); // 60% to 100% range
    return { ...item, x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${h} L ${points[0].x},${h} Z`;
  const cutoffY = paddingY + ((100 - 75) / 40) * (h - 2 * paddingY);

  return (
    <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <h4 className="text-sm font-bold text-white">6-Week Attendance Trajectory</h4>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          +5% Recovery in W6
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Historical aggregate attendance percentage across all enrolled lecture modules.
      </p>

      <div className="relative pt-1">
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-36 overflow-visible select-none">
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 75% Safe Threshold Cutoff line */}
          <line
            x1={paddingX}
            y1={cutoffY}
            x2={w - paddingX}
            y2={cutoffY}
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.85"
          />
          <text
            x={w - paddingX + 5}
            y={cutoffY + 3}
            fill="#f43f5e"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            75%
          </text>

          {/* Gradient Area */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Curve Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={pt.week}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#090d16"
                stroke={pt.pct >= 75 ? '#38bdf8' : '#f43f5e'}
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                fill={pt.pct >= 75 ? '#e2e8f0' : '#fca5a5'}
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {pt.pct}%
              </text>
              <text
                x={pt.x}
                y={h + 12}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
              >
                {pt.week}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * WeeklyWorkloadChart
 * Visual diagram of Mon-Sun academic activity & focused study hours distribution.
 */
export function WeeklyWorkloadChart() {
  const [activeDay, setActiveDay] = useState(0);

  const days = [
    { day: 'Mon', classHours: 4.5, studyHours: 2.5, completedTasks: 2, energy: 'Optimal' },
    { day: 'Tue', classHours: 3.5, studyHours: 3.0, completedTasks: 3, energy: 'Optimal' },
    { day: 'Wed', classHours: 5.0, studyHours: 1.5, completedTasks: 1, energy: 'Heavy' },
    { day: 'Thu', classHours: 3.0, studyHours: 4.0, completedTasks: 4, energy: 'Peak' },
    { day: 'Fri', classHours: 4.0, studyHours: 2.0, completedTasks: 2, energy: 'Moderate' },
    { day: 'Sat', classHours: 0.0, studyHours: 5.5, completedTasks: 5, energy: 'Deep Focus' },
    { day: 'Sun', classHours: 0.0, studyHours: 3.0, completedTasks: 2, energy: 'Recovery' },
  ];

  const totalClasses = days.reduce((acc, d) => acc + d.classHours, 0);
  const totalStudy = days.reduce((acc, d) => acc + d.studyHours, 0);
  const maxHours = 7;

  return (
    <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-darkBorder/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Weekly Academic Velocity Diagram</h3>
            <p className="text-xs text-slate-400">Scheduled classroom lectures vs. autonomous study blocks</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
            <span className="w-3 h-3 rounded bg-indigo-500" />
            <span>Lectures ({totalClasses}h)</span>
          </span>
          <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
            <span className="w-3 h-3 rounded bg-sky-400" />
            <span>Self-Study ({totalStudy}h)</span>
          </span>
        </div>
      </div>

      {/* Diagrammatic Bar Columns */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
        {days.map((d, i) => {
          const isSelected = activeDay === i;
          const classH = (d.classHours / maxHours) * 90;
          const studyH = (d.studyHours / maxHours) * 90;

          return (
            <div
              key={d.day}
              onClick={() => setActiveDay(i)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-glow-primary'
                  : 'bg-darkBg/60 border-darkBorder/60 hover:border-slate-700'
              }`}
            >
              <span className="text-[11px] font-mono text-slate-400 mb-2 font-semibold">
                {(d.classHours + d.studyHours).toFixed(1)}h
              </span>

              {/* Stacked Visual Bar */}
              <div className="w-7 sm:w-8 h-28 bg-slate-900 rounded-xl flex flex-col justify-end p-1 gap-1 overflow-hidden border border-slate-800">
                {/* Study Hours (Sky) */}
                {d.studyHours > 0 && (
                  <div
                    className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-md transition-all duration-300 shadow-sm"
                    style={{ height: `${studyH}%` }}
                    title={`Study: ${d.studyHours}h`}
                  />
                )}
                {/* Class Hours (Indigo) */}
                {d.classHours > 0 && (
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-md transition-all duration-300 shadow-sm"
                    style={{ height: `${classH}%` }}
                    title={`Lectures: ${d.classHours}h`}
                  />
                )}
              </div>

              {/* Day Label */}
              <span
                className={`text-xs mt-2 font-bold ${
                  isSelected ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Day Insight Strip */}
      <div className="p-3 rounded-2xl bg-darkBg/80 border border-darkBorder/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{days[activeDay].day} Breakdown:</span>
          <span className="text-slate-400">
            {days[activeDay].classHours}h classroom • {days[activeDay].studyHours}h self-study • {days[activeDay].completedTasks} assignments completed
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
          Energy: {days[activeDay].energy}
        </span>
      </div>
    </div>
  );
}

/**
 * StudyDistributionChart
 * Visual diagram of study hours & task completion distribution by subject.
 */
export function StudyDistributionChart({ studyPlan }) {
  const totalTasks = studyPlan.length;
  const completedTasks = studyPlan.filter((t) => t.completed).length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group by subject
  const subjectMap = {};
  studyPlan.forEach((task) => {
    const sub = task.subject || 'Other';
    if (!subjectMap[sub]) {
      subjectMap[sub] = { subject: sub, count: 0, completed: 0 };
    }
    subjectMap[sub].count += 1;
    if (task.completed) subjectMap[sub].completed += 1;
  });

  const subjectList = Object.values(subjectMap);

  const colors = [
    { fill: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-500' },
    { fill: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-400' },
    { fill: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-400' },
    { fill: '#c084fc', text: 'text-purple-400', bg: 'bg-purple-400' },
    { fill: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-400' },
  ];

  // SVG Radial Donut
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-darkBorder/70">
        <div>
          <h3 className="text-base font-bold text-white">Study Load & Completion Breakdown</h3>
          <p className="text-xs text-slate-400">Subject-wise task allocation and weekly target progression</p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {completedTasks}/{totalTasks} Blocks Cleared
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Donut Progress Diagram */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 select-none" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-darkBg"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#6366f1"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold font-mono text-white">{completionPct}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Done</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 font-medium">Weekly Target Momentum</span>
        </div>

        {/* Subject Allocation Bars */}
        <div className="sm:col-span-8 space-y-3">
          {subjectList.map((item, idx) => {
            const color = colors[idx % colors.length];
            const pct = Math.round((item.count / totalTasks) * 100);
            return (
              <div key={item.subject} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.subject}</span>
                  <span className="text-slate-400 font-mono">
                    {item.completed}/{item.count} tasks ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-darkBg rounded-full overflow-hidden p-[1px] border border-darkBorder">
                  <div
                    className={`h-full rounded-full ${color.bg} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

