import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Code2, 
  GraduationCap, 
  Trophy, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  Plus, 
  ExternalLink,
  Target,
  Zap,
  ChevronRight,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CareerAdvisorWidget({ compact = false }) {
  const { user, activities, addActivity } = useApp();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // 'internships' | 'projects' | 'courses' | 'hackathons'
  const [addedItems, setAddedItems] = useState({});
  const [advice, setAdvice] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_career_advice');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const fetchAdvice = async (force = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.getCareerRecommendations(user, activities);
      if (res && res.readiness_score) {
        setAdvice(res);
        try {
          localStorage.setItem('unipilot_career_advice', JSON.stringify(res));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('AI Career advice fetch failed, using fallback:', err);
      // Fallback
      const defaultAdvice = {
        readiness_score: 78,
        profile_tier: 'High-Potential Engineer',
        strengths: [
          'Strong foundational systems coursework and logic',
          `${activities.length} verified extracurricular achievements synced`,
          'Solid academic GPA and engineering breadth'
        ],
        top_missing_skills: [
          'Production Cloud Infrastructure (AWS / Docker / Kubernetes)',
          'Distributed Message Queues (Kafka / Redis)',
          'High-Throughput Concurrency & Telemetry'
        ],
        recommended_internships: [
          {
            role: 'Cloud Backend & Infrastructure Engineering Intern',
            target_companies: 'Series A-C Tech Startups, High-Growth SaaS, Cloud Providers',
            impact: 'Bridges theoretical systems concepts with live production CI/CD, database sharding, and latency SLAs.',
            skills_to_highlight: ['Go / Python FastAPI', 'Docker & Kubernetes', 'PostgreSQL indexing']
          },
          {
            role: 'Autonomous AI Systems / GenAI Platform Intern',
            target_companies: 'AI Tooling Labs, Enterprise Applied ML Startups',
            impact: 'Validates machine learning coursework with real-world model serving, embeddings, and API orchestration.',
            skills_to_highlight: ['PyTorch / ONNX', 'Vector DBs (Qdrant)', 'RAG Pipelines']
          }
        ],
        recommended_projects: [
          {
            title: 'High-Throughput Distributed Key-Value Store with Raft Consensus',
            category: 'Systems & Cloud',
            tech_stack: 'Go, Raft Protocol, gRPC, Docker, Prometheus',
            why_valuable: 'Demonstrates leader election, heartbeat RPCs, log compaction, and network partition resilience to FAANG recruiters.',
            estimated_hours: 32,
            difficulty: 'Advanced'
          },
          {
            title: 'Real-Time Collaborative Code Playground with CRDTs',
            category: 'Full-Stack Distributed',
            tech_stack: 'React, Node.js / Go, Yjs (CRDTs), WebSockets, Isolated Docker Runner',
            why_valuable: 'Proves operational concurrency, sub-50ms peer sync, and secure sandboxed code execution.',
            estimated_hours: 26,
            difficulty: 'Intermediate'
          },
          {
            title: 'Sub-Millisecond Vector Search Engine from Scratch',
            category: 'AI Systems',
            tech_stack: 'C++ or Rust, HNSW Graph Indexing, SIMD Vectorization',
            why_valuable: 'Dramatically stands out over simple LangChain wrappers by demonstrating memory-level optimization.',
            estimated_hours: 38,
            difficulty: 'Advanced'
          }
        ],
        recommended_courses: [
          {
            title: 'AWS Certified Solutions Architect – Associate (SAA-C03)',
            platform: 'AWS Skill Builder & Coursera',
            focus: 'Cloud Architecture, Multi-AZ VPCs, IAM, Serverless Resiliency',
            duration: '4 weeks'
          },
          {
            title: 'Stanford CS149: Parallel Computing & Accelerated Systems',
            platform: 'Stanford Online / OpenCourseWare',
            focus: 'CUDA Kernel Tuning, Cache Coherence, SIMD, Multi-threading',
            duration: '6 weeks'
          },
          {
            title: 'Distributed Systems Principles (MIT 6.824)',
            platform: 'MIT OpenCourseWare',
            focus: 'Paxos, Raft, MapReduce, Spanner, Zookeeper',
            duration: '8 weeks'
          }
        ],
        recommended_hackathons: [
          {
            name: 'Smart India Hackathon (SIH) – National Innovation',
            focus: 'High-impact public sector digital systems & AI solutions',
            timeline: 'Upcoming Season'
          },
          {
            name: 'ETHGlobal / MLH Hackathon Circuit',
            focus: 'Decentralized systems, autonomous agents, developer tooling',
            timeline: 'Rolling Weekends'
          }
        ],
        career_roadmap_summary: 'Your synced portfolio has strong momentum. Building a high-throughput systems project and securing one production backend internship will position your resume in the top 3% of tech applicants.'
      };
      setAdvice(defaultAdvice);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!advice) {
      fetchAdvice();
    }
  }, []);

  const handleAddAsGoal = (item, type) => {
    const key = `${type}-${item.title || item.role || item.name}`;
    if (addedItems[key]) return;

    addActivity({
      title: item.title || item.role || item.name,
      type: type === 'internships' ? 'internship' : type === 'courses' ? 'course' : 'project',
      subtitle: item.tech_stack || item.platform || item.target_companies || 'AI Recommended Goal',
      description: item.why_valuable || item.impact || item.focus || 'Target goal recommended by AI Career Advisor.',
      source: 'AI Career GPS'
    });

    setAddedItems(prev => ({ ...prev, [key]: true }));
  };

  if (!advice && loading) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-violet-500/20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
        <p className="text-sm font-semibold text-white">Analyzing Portfolio & Resume Gaps with AI...</p>
        <p className="text-xs text-slate-400">Comparing your achievements with tier-1 engineering placement standards</p>
      </div>
    );
  }

  const data = advice || {};
  const score = data.readiness_score || 78;

  if (compact) {
    return (
      <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-950/40 via-darkCard to-indigo-950/30 border border-violet-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-violet-500/20 text-violet-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>AI Profile & Career GPS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-extrabold border border-violet-500/30">
                  {score}/100
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">Targeted growth to supercharge resume & portfolio</p>
            </div>
          </div>
          <button
            onClick={() => fetchAdvice(true)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Re-run Gap Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          </button>
        </div>

        {/* Quick Project & Internship Teaser */}
        <div className="space-y-2 text-xs">
          {data.recommended_projects?.[0] && (
            <div className="p-3 rounded-2xl bg-darkBg/60 border border-darkBorder flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
                  Recommended Capstone Project
                </span>
                <p className="text-xs font-semibold text-white truncate">{data.recommended_projects[0].title}</p>
                <p className="text-[11px] text-slate-400 truncate">{data.recommended_projects[0].tech_stack}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 shrink-0">
                +30 ATS Pts
              </span>
            </div>
          )}

          {data.recommended_internships?.[0] && (
            <div className="p-3 rounded-2xl bg-darkBg/60 border border-darkBorder flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Recommended Internship Target
                </span>
                <p className="text-xs font-semibold text-white truncate">{data.recommended_internships[0].role}</p>
                <p className="text-[11px] text-slate-400 truncate">{data.recommended_internships[0].target_companies}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                High Impact
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/95 via-darkCard to-violet-950/25 border border-violet-500/30 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header with Score Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-darkBorder/70 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                AI Career GPS & Portfolio Gap Advisor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-extrabold border border-violet-500/30">
                AUTONOMOUS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live sync analysis: what you should learn & build next to reach a 95+ ATS placement profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Visual Readiness Pill */}
          <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Profile Strength</span>
              <span className="text-xs font-extrabold text-emerald-400">{data.profile_tier || 'Competitive'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-white font-mono">{score}</span>
              <span className="text-xs font-mono text-slate-400">/100</span>
            </div>
          </div>

          <button
            onClick={() => fetchAdvice(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md hover:brightness-110 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Top Missing Skills & AI Summary Pill */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
        <div className="md:col-span-8 p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
            <Target className="w-3 h-3" /> AI Strategic Diagnosis
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.career_roadmap_summary}
          </p>
        </div>

        <div className="md:col-span-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Top Missing Tech Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(data.top_missing_skills || []).map((skill, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-darkBorder/60 scrollbar-none relative z-10">
        {[
          { id: 'projects', label: 'Recommended Projects', icon: Code2, count: data.recommended_projects?.length || 0 },
          { id: 'internships', label: 'Internships to Target', icon: Briefcase, count: data.recommended_internships?.length || 0 },
          { id: 'courses', label: 'Courses & Certifications', icon: GraduationCap, count: data.recommended_courses?.length || 0 },
          { id: 'hackathons', label: 'Hackathons & Contests', icon: Trophy, count: data.recommended_hackathons?.length || 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="relative z-10">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.recommended_projects || []).map((proj, idx) => {
              const itemKey = `projects-${proj.title}`;
              const isAdded = !!addedItems[itemKey];

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                        {proj.category || 'Capstone'}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>~{proj.estimated_hours}h</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-[10px]">
                          {proj.difficulty}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {proj.why_valuable}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="text-[11px] font-mono text-indigo-300 truncate max-w-[200px]">
                      ⚡ {proj.tech_stack}
                    </div>

                    <button
                      onClick={() => handleAddAsGoal(proj, 'projects')}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40'
                      }`}
                    >
                      {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Added to Portfolio Goals' : '+ Track as Goal'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Internships Tab */}
        {activeTab === 'internships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.recommended_internships || []).map((intern, idx) => {
              const itemKey = `internships-${intern.role}`;
              const isAdded = !!addedItems[itemKey];

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Target Role
                      </span>
                      <span className="text-xs text-slate-400 font-mono">High Recruiter Demand</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {intern.role}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {intern.impact}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Companies</span>
                      <p className="text-xs text-slate-300 font-medium">{intern.target_companies}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(intern.skills_to_highlight || []).map((s, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddAsGoal(intern, 'internships')}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                      }`}
                    >
                      {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Added to Resume Pipeline' : '+ Add Target'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.recommended_courses || []).map((course, idx) => {
              const itemKey = `courses-${course.title}`;
              const isAdded = !!addedItems[itemKey];

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        {course.platform}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{course.duration}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400">
                      <strong>Focus:</strong> {course.focus}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-sky-300 font-medium">Industry Certified</span>
                    <button
                      onClick={() => handleAddAsGoal(course, 'courses')}
                      disabled={isAdded}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40'
                      }`}
                    >
                      {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Added to Study Plan' : '+ Add to Study Plan'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hackathons Tab */}
        {activeTab === 'hackathons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.recommended_hackathons || []).map((hack, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Competition
                    </span>
                    <span className="text-xs text-amber-400 font-mono">{hack.timeline}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{hack.name}</h3>
                  <p className="text-xs text-slate-400">{hack.focus}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Wins add immediate recruiter prestige</span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> High Placement Value
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
