import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  UploadCloud, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Star, 
  GitFork, 
  Code2, 
  CheckSquare, 
  Square,
  FileCheck,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { Github } from '../components/Icons';
import { useApp } from '../context/AppContext';

export default function ImportData() {
  const navigate = useNavigate();
  const { addActivity, user } = useApp();

  const [activeTab, setActiveTab] = useState('github'); // 'github' | 'certificate'

  // GitHub Import State
  const [username, setUsername] = useState(user.github || '');
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [repos, setRepos] = useState([]);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);

  // Certificate Import State
  const [certUploaded, setCertUploaded] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const certFileRef = React.useRef(null);
  const [extractedCert, setExtractedCert] = useState({
    courseName: '',
    platform: '',
    issuer: '',
    date: '',
    credentialId: '',
    bullets: []
  });
  const [isEditingCert, setIsEditingCert] = useState(false);

  const toggleRepoSelection = (id) => {
    setRepos(repos.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleFetchRepos = () => {
    setIsFetchingRepos(true);
    setTimeout(() => {
      setIsFetchingRepos(false);
      setHasFetched(true);
    }, 800);
  };

  const handleGenerateBullets = () => {
    setIsGeneratingBullets(true);
    setTimeout(() => {
      setIsGeneratingBullets(false);
    }, 900);
  };

  const handleAddReposToFeed = () => {
    const selected = repos.filter(r => r.selected);
    selected.forEach(r => {
      addActivity({
        type: 'project',
        title: `${r.name}`,
        subtitle: `GitHub: ${username}/${r.name} • ${r.language}`,
        date: 'Recent',
        source: 'Imported',
        description: r.description,
        bullets: r.generatedBullets
      });
    });
    navigate('/feed');
  };

  const handleConfirmCert = () => {
    addActivity({
      type: 'course',
      title: extractedCert.courseName,
      subtitle: `${extractedCert.platform} • ${extractedCert.issuer}`,
      date: extractedCert.date,
      source: 'Imported',
      description: `Official certification credential ${extractedCert.credentialId}`,
      bullets: extractedCert.bullets
    });
    navigate('/feed');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Automated Ingestion & Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Eliminate manual typing. Import certified credentials and public GitHub projects directly into your Activity Feed & Resume.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'github'
              ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-glow-primary'
              : 'bg-darkCard border border-darkBorder text-slate-400 hover:text-white'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repositories Import</span>
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'certificate'
              ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-glow-primary'
              : 'bg-darkCard border border-darkBorder text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate PDF / Link Ingestion</span>
        </button>
      </div>

      {/* GitHub Import Flow */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          {/* Username Fetch Bar */}
          <div className="p-5 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-lg flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative">
              <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username (e.g. alexrivera-dev)"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleFetchRepos}
              disabled={isFetchingRepos}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              {isFetchingRepos ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isFetchingRepos ? 'Scanning Repos...' : 'Fetch Public Repos'}</span>
            </button>
          </div>

          {/* Repo Cards Grid */}
          {hasFetched && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <span className="text-xs text-slate-400">
                  Select the repositories you want to highlight as projects on your living resume:
                </span>
                <button
                  onClick={handleGenerateBullets}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingBullets ? 'Generating ATS Bullets...' : 'Regenerate AI Bullets'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => toggleRepoSelection(repo.id)}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                      repo.selected
                        ? 'bg-gradient-to-b from-indigo-950/40 to-darkCard border-indigo-500/80 shadow-glow-primary'
                        : 'bg-darkCard/60 border-darkBorder/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" /> {repo.language}
                        </span>
                        <div className="text-slate-400">
                          {repo.selected ? (
                            <CheckSquare className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{repo.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5" /> {repo.forks}
                        </span>
                      </div>
                    </div>

                    {/* AI Generated Bullet Preview */}
                    <div className="mt-4 pt-3 border-t border-darkBorder/60 text-[11px] text-slate-300 space-y-1 bg-darkBg/60 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">
                        AI Resume Bullet Preview:
                      </span>
                      <p className="line-clamp-2 italic">&ldquo;{repo.generatedBullets[0]}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAddReposToFeed}
                  disabled={repos.filter(r => r.selected).length === 0}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    Add {repos.filter(r => r.selected).length} Selected Repos as Projects
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Ingestion Flow */}
      {activeTab === 'certificate' && (
        <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-6">
          {/* Upload Drop Zone */}
          <input
            type="file"
            ref={certFileRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setIsExtracting(true);
              setTimeout(() => {
                const nameNoExt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
                setExtractedCert({
                  courseName: nameNoExt,
                  platform: 'Detected from certificate',
                  issuer: 'Detected from certificate',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                  credentialId: `CERT-${Date.now().toString(36).toUpperCase()}`,
                  bullets: [
                    `Completed ${nameNoExt} certification validating domain expertise.`,
                    'Demonstrated proficiency through rigorous assessment and capstone evaluation.'
                  ]
                });
                setCertUploaded(true);
                setIsExtracting(false);
                setIsEditingCert(true);
              }, 1000);
            }}
          />
          <div
            onClick={() => certFileRef.current?.click()}
            className="border-2 border-dashed border-darkBorder hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-darkBg/50 cursor-pointer transition-all"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin" />
                <h4 className="text-sm font-bold text-white">Extracting certificate details...</h4>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Upload Certificate PDF or image scan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Coursera, edX, Infosys, AWS, and university completion credentials.
                </p>
              </>
            )}
          </div>

          {/* Extracted Review Card */}
          {certUploaded && (
            <div className="p-5 rounded-2xl bg-darkBg border border-darkBorder space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-darkBorder">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">AI Extracted Certification Details</span>
                </div>
                <button
                  onClick={() => setIsEditingCert(!isEditingCert)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingCert ? 'Done Editing' : 'Edit Details'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Course / Certification Title:</span>
                  {isEditingCert ? (
                    <input
                      type="text"
                      value={extractedCert.courseName}
                      onChange={(e) => setExtractedCert({ ...extractedCert, courseName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-darkCard border border-darkBorder text-white"
                    />
                  ) : (
                    <strong className="text-white text-sm">{extractedCert.courseName}</strong>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Platform / Institution:</span>
                  {isEditingCert ? (
                    <input
                      type="text"
                      value={extractedCert.platform}
                      onChange={(e) => setExtractedCert({ ...extractedCert, platform: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-darkCard border border-darkBorder text-white"
                    />
                  ) : (
                    <strong className="text-white text-sm">{extractedCert.platform}</strong>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Issuer / Accrediting Body:</span>
                  <p className="text-slate-200">{extractedCert.issuer}</p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Completion Date:</span>
                  <p className="text-slate-200">{extractedCert.date}</p>
                </div>
              </div>

              {/* Extracted Bullets */}
              <div className="p-3.5 rounded-xl bg-darkCard border border-darkBorder/80 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">
                  Recruiter-Ready Bullets Generated for Resume:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {extractedCert.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleConfirmCert}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm & Add to Feed</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
