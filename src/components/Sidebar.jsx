import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  BookOpenCheck, 
  CheckCircle2, 
  CalendarRange, 
  CalendarDays, 
  Sparkles, 
  FileText, 
  Globe2, 
  Bell, 
  UserCircle2, 
  ArrowUpRight,
  RefreshCw,
  Compass,
  ExternalLink,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { user, hasNewActivityForResume } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chat', label: 'UniPilot Chat', icon: MessageSquareCode, badge: 'AI' },
    { to: '/notes', label: 'Notes & Doubts', icon: BookOpenCheck },
    { to: '/attendance', label: 'Attendance Analyzer', icon: CheckCircle2 },
    { to: '/planner', label: 'Smart Planner', icon: CalendarRange },
    { to: '/timetable', label: 'Timetable & Tasks', icon: CalendarDays },
    { to: '/feed', label: 'Activity Feed', icon: Sparkles, highlight: true },
    { 
      to: '/resume', 
      label: 'Resume Builder', 
      icon: FileText, 
      syncAlert: hasNewActivityForResume 
    },
    { 
      to: '/portfolio', 
      label: 'Portfolio Website', 
      icon: Globe2,
      syncAlert: hasNewActivityForResume 
    },
    { to: '/reminders', label: 'Reminders & Alerts', icon: Bell },
    { to: '/profile', label: 'Profile & Settings', icon: UserCircle2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-darkCard/90 border-r border-darkBorder/80 backdrop-blur-xl h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-darkBorder/60">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-glow-primary transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-darkBg/90 rounded-[11px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">UniPilot</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous Assistant</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Academic
        </div>
        {navItems.slice(0, 6).map((item) => (
          <NavLinkItem key={item.to} item={item} />
        ))}
        {/* External Core Academic Portal */}
        <a
          href="https://qxff58p4-5005.inc1.devtunnels.ms/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Cpu className="w-4 h-4 shrink-0 text-sky-400" />
            <span className="truncate">Core Academic Portal</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0" />
        </a>



        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Career & Profile</span>
          {hasNewActivityForResume && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </div>
        {navItems.slice(6, 9).map((item) => (
          <NavLinkItem key={item.to} item={item} />
        ))}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Preferences
        </div>
        {navItems.slice(9).map((item) => (
          <NavLinkItem key={item.to} item={item} />
        ))}
        
      </nav>


      {/* Sync Status Banner */}
      {hasNewActivityForResume && (
        <div className="mx-3 mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px] font-medium">New activity logged</span>
          </div>
          <NavLink to="/resume" className="text-[11px] underline font-semibold hover:text-amber-200">
            Regenerate
          </NavLink>
        </div>
      )}

      {/* Profile Footer */}
      <div className="p-3 border-t border-darkBorder/60 bg-darkBg/40">
        <NavLink 
          to="/profile" 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-darkCardHover/80 transition-colors group"
        >
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.college}</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </NavLink>
      </div>
    </aside>
  );
}

function NavLinkItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `
        group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-glow-primary border border-indigo-400/30' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 transition-colors ${item.highlight ? 'text-indigo-400' : ''}`} />
        <span className="truncate">{item.label}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.badge && (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
            {item.badge}
          </span>
        )}
        {item.syncAlert && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            Sync
          </span>
        )}
      </div>
    </NavLink>
  );
}
