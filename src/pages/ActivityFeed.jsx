import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  Trophy, 
  BookOpen, 
  Briefcase, 
  FolderGit2, 
  ShieldCheck, 
  GraduationCap, 
  Tag, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  FileText, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ActivityFeed() {
  const navigate = useNavigate();
  const { activities, hasNewActivityForResume } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filters = ['All', 'Hackathons', 'Courses', 'Internships', 'Projects', 'Responsibilities'];

  const filteredActivities = activities.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Hackathons') return item.type === 'hackathon';
    if (selectedFilter === 'Courses') return item.type === 'course';
    if (selectedFilter === 'Internships') return item.type === 'internship';
    if (selectedFilter === 'Projects') return item.type === 'project';
    if (selectedFilter === 'Responsibilities') return item.type === 'responsibility';
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hackathon':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'course':
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'internship':
        return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'project':
        return <FolderGit2 className="w-5 h-5 text-purple-400" />;
      case 'responsibility':
        return <ShieldCheck className="w-5 h-5 text-rose-400" />;
      default:
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'Auto-captured':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Imported':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Manual':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Unified Activity Feed
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              Single Source of Truth
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every academic milestone, hackathon, online certification, and codebase automatically compiles your ATS resume & portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/import')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <span>Import Certificate / GitHub</span>
          </button>

          <button
            onClick={() => navigate('/add-achievement')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-primary transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add to Feed</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-500 ml-1 mr-1 shrink-0" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === f
                ? 'bg-indigo-600 text-white shadow-glow-primary'
                : 'bg-darkCard border border-darkBorder/80 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      {filteredActivities.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-darkCard border border-darkBorder space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your activity feed is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log your first hackathon, internship, course certification or import from GitHub to power your living resume.
          </p>
          <button
            onClick={() => navigate('/add-achievement')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-glow-primary"
          >
            Add Your First Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder/90 hover:border-slate-700 transition-all cursor-pointer shadow-lg space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-darkBg border border-darkBorder shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSourceBadge(item.source)}`}>
                          {item.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Collapsible details and AI recruiter bullets */}
                {isExpanded && (
                  <div className="pt-3 border-t border-darkBorder/60 space-y-3 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="p-4 rounded-2xl bg-darkBg/80 border border-darkBorder/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Recruiter-Ready Bullet Points (ATS Formatted)
                        </span>
                        <span className="text-[10px] text-slate-500">Live in Master Resume</span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                        {item.bullets.map((b, i) => (
                          <li key={i} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => navigate('/resume')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View in Resume Builder</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
