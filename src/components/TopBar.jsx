import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Plus, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Check, 
  ExternalLink,
  ChevronDown,
  Users,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { 
    user, 
    notifications, 
    markAllNotificationsRead, 
    hasNewActivityForResume, 
    regenerateResume, 
    setQuickAddOpen,
    portalRole,
    SAMPLE_STUDENTS,
    selectStudent
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-darkCard/80 backdrop-blur-xl border-b border-darkBorder/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Search / Copilot Input trigger or Student Switcher */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Parent / Teacher Mode Student Switcher */}
        {portalRole === 'guardian' ? (
          <div className="relative">
            <button
              onClick={() => setShowStudentDropdown(!showStudentDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-semibold hover:bg-purple-500/20 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] text-purple-300">Viewing Child / Student:</span>
              <span className="font-bold text-white underline decoration-purple-400">{user.name}</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </button>

            {showStudentDropdown && (
              <div 
                className="absolute left-0 mt-2 w-72 rounded-2xl bg-darkCard border border-darkBorder shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowStudentDropdown(false)}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-darkBorder">
                  Switch Student / Ward
                </div>
                <div className="space-y-1 mt-1 max-h-56 overflow-y-auto">
                  {SAMPLE_STUDENTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectStudent(s.id)}
                      className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                        user.id === s.id ? 'bg-purple-600/30 text-white font-bold' : 'hover:bg-darkBg text-slate-300'
                      }`}
                    >
                      <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.course}</p>
                      </div>
                      <span className={`text-[10px] font-bold ${s.attendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {s.attendancePct}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={() => navigate('/chat')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-darkBg/80 border border-darkBorder/80 text-xs text-slate-400 cursor-pointer hover:border-indigo-500/50 hover:bg-darkBg transition-all group shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="truncate">Ask UniPilot anything... (e.g. &ldquo;Can I bunk today?&rdquo;)</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-700">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Switch Portal Role Link */}
        <button
          onClick={() => navigate('/login')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-darkBg border border-darkBorder text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Switch between Student and Parent/Teacher portal login"
        >
          {portalRole === 'guardian' ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student View</span>
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Parent / Teacher Portal</span>
            </>
          )}
        </button>

        {/* Living Sync Badge */}
        {hasNewActivityForResume ? (
          <button
            onClick={() => {
              regenerateResume();
              navigate('/resume');
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all animate-pulse"
            title="New Activity Feed entries are ready to incorporate"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span className="hidden md:inline">⟳ New activity available —</span>
            <span>Regenerate</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <Check className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Sync Active</span>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllNotificationsRead();
            }}
            className="p-2 rounded-xl bg-darkBg/80 border border-darkBorder/80 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-darkCard border border-darkBorder shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-darkBorder">
                <span className="font-bold text-sm text-white">Notifications & Alerts</span>
                <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer" onClick={() => navigate('/reminders')}>
                  View all in Reminders
                </span>
              </div>
              <div className="divide-y divide-darkBorder/60 max-h-80 overflow-y-auto pt-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.type === 'warning' ? 'bg-amber-400' : n.type === 'urgent' ? 'bg-rose-400' : 'bg-sky-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-primary transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>
      </div>
    </header>
  );
}
