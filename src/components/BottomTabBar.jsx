import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  CheckCircle2, 
  Sparkles, 
  Menu, 
  X,
  BookOpenCheck,
  CalendarRange,
  CalendarDays,
  FileText,
  Globe2,
  Bell,
  UserCircle2,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomTabBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setQuickAddOpen, hasNewActivityForResume } = useApp();

  const primaryTabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/chat', label: 'Chat', icon: MessageSquareCode },
    { to: '/attendance', label: 'Attendance', icon: CheckCircle2 },
    { to: '/feed', label: 'Feed', icon: Sparkles },
  ];

  const drawerTabs = [
    { to: '/notes', label: 'Notes & Doubts', icon: BookOpenCheck },
    { to: '/planner', label: 'Smart Planner', icon: CalendarRange },
    { to: '/timetable', label: 'Timetable & Tasks', icon: CalendarDays },
    { to: '/resume', label: 'Resume Builder', icon: FileText, alert: hasNewActivityForResume },
    { to: '/portfolio', label: 'Portfolio Generator', icon: Globe2, alert: hasNewActivityForResume },
    { to: '/reminders', label: 'Reminders & Alerts', icon: Bell },
    { to: '/profile', label: 'Profile & Settings', icon: UserCircle2 },
  ];

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {menuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className="absolute bottom-16 inset-x-0 bg-darkCard border-t border-darkBorder rounded-t-3xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-darkBorder">
              <span className="font-bold text-base text-white">More Modules</span>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-4">
              {drawerTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                        : 'bg-darkBg/60 border-darkBorder/70 text-slate-300 hover:bg-darkCardHover'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    {tab.alert && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 ml-auto animate-pulse"></span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-darkBorder flex gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setQuickAddOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-primary"
              >
                <Plus className="w-4 h-4" /> Quick Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-darkCard/95 border-t border-darkBorder/80 backdrop-blur-xl z-40 px-3 py-2 flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors
                ${isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative ${
            menuOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
          {hasNewActivityForResume && (
            <span className="absolute top-1 right-3 w-2 h-2 bg-amber-400 rounded-full"></span>
          )}
        </button>
      </nav>
    </>
  );
}
