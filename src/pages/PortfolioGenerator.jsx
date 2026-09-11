import React, { useState } from 'react';
import { 
  Globe2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Layers, 
  Mail, 
  Trophy, 
  Award, 
  Code2, 
  FolderGit2
} from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';
import { useApp } from '../context/AppContext';
import CareerAdvisorWidget from '../components/CareerAdvisorWidget';

export default function PortfolioGenerator() {
  const { user, activities, hasNewActivityForResume, regenerateResume, lastResumeSync } = useApp();

  const [publishedUrl, setPublishedUrl] = useState(`https://${user.github || 'alexrivera'}.unipilot.me`);
  const [isCopied, setIsCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [themeMode, setThemeMode] = useState('midnight'); // 'midnight' | 'minimal'

  // Section visibility and order
  const [sectionsOrder, setSectionsOrder] = useState([
    { id: 'about', label: 'About & Bio', enabled: true },
    { id: 'projects', label: 'Featured Projects', enabled: true },
    { id: 'achievements', label: 'Hackathons & Honors', enabled: true },
    { id: 'skills', label: 'Core Technical Skills', enabled: true },
    { id: 'certifications', label: 'Certifications & MOOCs', enabled: true },
    { id: 'education', label: 'Education', enabled: true },
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publishedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
      regenerateResume();
    }, 800);
  };

  const moveSection = (idx, direction) => {
    const newOrder = [...sectionsOrder];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionsOrder(newOrder);
  };

  const toggleSectionEnable = (id) => {
    setSectionsOrder(sectionsOrder.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const projects = activities.filter(a => a.type === 'project');
  const hackathons = activities.filter(a => a.type === 'hackathon');
  const courses = activities.filter(a => a.type === 'course');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              One-Click Portfolio Website
            </h1>

            {/* Living Sync Badge */}
            {hasNewActivityForResume ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>⟳ New activity available</span>
                <button
                  onClick={() => regenerateResume()}
                  className="ml-1 px-2 py-0.5 rounded-md bg-amber-500 text-darkBg font-extrabold"
                >
                  Update Now
                </button>
              </div>
            ) : (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" /> Live Synced ({lastResumeSync})
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Auto-generated responsive developer portfolio hosted on a unique personalized domain.
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied URL!' : 'Copy Portfolio Link'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:opacity-95 text-white font-bold text-xs shadow-glow-primary transition-all active:scale-95"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
            <span>{isPublishing ? 'Publishing Site...' : 'Publish & Sync'}</span>
          </button>
        </div>
      </div>

      {/* AI Portfolio & Career Gap Advisor */}
      <CareerAdvisorWidget />

      {/* Main Grid: Controls Left (4 cols), Live Mobile/Desktop View Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hosted Domain & Controls
            </h3>

            <div className="p-3 rounded-2xl bg-darkBg border border-darkBorder flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-300 truncate">{publishedUrl}</span>
              <span
                className="p-1 text-slate-500 cursor-not-allowed"
                title="Preview only — portfolio is not yet deployed to an external domain"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="pt-2 border-t border-darkBorder/60 space-y-2">
              <span className="text-xs font-bold text-white block">Reorder / Customize Sections</span>
              <p className="text-[11px] text-slate-400">
                Arrange the visual hierarchy of your public portfolio:
              </p>

              <div className="space-y-1.5">
                {sectionsOrder.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-2.5 rounded-xl bg-darkBg border border-darkBorder/80 flex items-center justify-between text-xs"
                  >
                    <span className={sec.enabled ? 'text-white' : 'text-slate-500 line-through'}>
                      {sec.label}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sectionsOrder.length - 1}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Portfolio Preview (8 cols) */}
        <div className="lg:col-span-8">
          {/* Simulated Browser Frame */}
          <div className="rounded-3xl border border-darkBorder/80 bg-slate-950 overflow-hidden shadow-2xl">
            {/* Browser Top Bar */}
            <div className="px-4 py-3 bg-darkCard/90 border-b border-darkBorder/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="px-4 py-1 rounded-full bg-darkBg/90 text-[11px] font-mono text-slate-400 border border-darkBorder/60 max-w-sm truncate">
                {publishedUrl}
              </div>

              <div className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                LIVE
              </div>
            </div>

            {/* Generated Portfolio Content inside iframe mockup */}
            <div className="p-6 sm:p-10 space-y-12 bg-gradient-to-b from-darkBg via-slate-950 to-darkBg text-slate-100 max-h-[600px] overflow-y-auto">
              {/* Hero / About */}
              <div className="text-center space-y-4 pt-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-indigo-500/40 shadow-glow-primary"
                />
                <div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{user.name}</h2>
                  <p className="text-xs sm:text-sm text-indigo-400 font-medium mt-1">{user.tagline}</p>
                </div>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Building fault-tolerant distributed systems and fine-tuning lightweight LLMs for real-time edge workloads.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="p-2 rounded-xl bg-darkCard border border-darkBorder text-slate-300 hover:text-white">
                    <Github className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-xl bg-darkCard border border-darkBorder text-slate-300 hover:text-white">
                    <Linkedin className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-xl bg-darkCard border border-darkBorder text-slate-300 hover:text-white">
                    <Mail className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-darkBorder/70">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Featured Projects</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-darkCard/60 border border-darkBorder/80 space-y-2 hover:border-indigo-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="pt-2 flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                        <span>{p.subtitle}</span>
                        <span className="text-slate-500">{p.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hackathons & Achievements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-darkBorder/70">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Hackathons & Accolades</h3>
                </div>

                <div className="space-y-2.5">
                  {hackathons.map((h) => (
                    <div key={h.id} className="p-3.5 rounded-2xl bg-darkCard/60 border border-darkBorder/80 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{h.title}</h4>
                        <p className="text-[11px] text-slate-400">{h.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-darkBorder/70">
                  <Award className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Verified Certifications</h3>
                </div>

                <div className="space-y-2">
                  {courses.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-darkCard/40 border border-darkBorder/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{c.title}</span>
                        <span className="text-slate-400 ml-2">({c.subtitle})</span>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">✓ Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-8 border-t border-darkBorder/40 text-[11px] text-slate-500">
                Generated autonomously via <strong className="text-indigo-400 font-semibold">UniPilot</strong> • Last published {lastResumeSync}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
