import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  BookOpen, 
  Briefcase, 
  FolderGit2, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  UploadCloud, 
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AddAchievement() {
  const navigate = useNavigate();
  const { addActivity } = useApp();

  const [selectedType, setSelectedType] = useState('hackathon');
  const [toastMessage, setToastMessage] = useState(null);

  // Forms state
  const [formData, setFormData] = useState({
    // Hackathon
    hackathonName: '',
    eventName: '',
    hackDate: '',
    teamSize: '',
    result: '',
    hackDesc: '',

    // Online Course
    courseTitle: '',
    platform: 'Coursera',
    completionDate: '',
    courseDesc: '',

    // Internship
    company: '',
    role: '',
    duration: '',
    internDesc: '',

    // Position of Responsibility
    leadTitle: '',
    organization: '',
    respDuration: '',
    respDesc: '',

    // Project
    projectName: '',
    projectTech: '',
    projectDuration: '',
    projectDesc: ''
  });

  const types = [
    { id: 'hackathon', label: 'Hackathon', icon: Trophy, desc: 'Competitions & awards' },
    { id: 'course', label: 'Online Course', icon: BookOpen, desc: 'Certifications & MOOCs' },
    { id: 'internship', label: 'Internship', icon: Briefcase, desc: 'Work experience' },
    { id: 'project', label: 'Project', icon: FolderGit2, desc: 'Technical projects' },
    { id: 'responsibility', label: 'Position of Responsibility', icon: ShieldCheck, desc: 'Leadership & clubs' },
  ];

  const handleSave = (isDraft = false) => {
    let newEntry;

    if (selectedType === 'hackathon') {
      newEntry = {
        type: 'hackathon',
        title: `${formData.result} — ${formData.hackathonName}`,
        subtitle: `${formData.eventName} • Team of ${formData.teamSize}`,
        date: formData.hackDate,
        source: 'Manual',
        description: formData.hackDesc,
        bullets: [
          `Engineered ${formData.hackathonName} submission with ${formData.teamSize} targeting ${formData.eventName}.`,
          `Awarded ${formData.result} among 400+ competing developers.`
        ]
      };
    } else if (selectedType === 'course') {
      newEntry = {
        type: 'course',
        title: formData.courseTitle,
        subtitle: `Issued by ${formData.platform}`,
        date: formData.completionDate,
        source: 'Manual',
        description: formData.courseDesc,
        bullets: [
          `Completed rigorous curriculum in ${formData.courseTitle} on ${formData.platform}.`,
          `Mastered applied concepts with verified capstone validation.`
        ]
      };
    } else if (selectedType === 'internship') {
      newEntry = {
        type: 'internship',
        title: formData.role,
        subtitle: formData.company,
        date: formData.duration,
        source: 'Manual',
        description: formData.internDesc,
        bullets: [
          `Served as ${formData.role} at ${formData.company}, spearheading core reliability initiatives.`,
          `${formData.internDesc}`
        ]
      };
    } else if (selectedType === 'responsibility') {
      newEntry = {
        type: 'responsibility',
        title: formData.leadTitle,
        subtitle: formData.organization,
        date: formData.respDuration,
        source: 'Manual',
        description: formData.respDesc,
        bullets: [
          `Elected as ${formData.leadTitle} for ${formData.organization}.`,
          `${formData.respDesc}`
        ]
      };
    } else {
      newEntry = {
        type: 'project',
        title: formData.projectName,
        subtitle: formData.projectTech,
        date: formData.projectDuration,
        source: 'Manual',
        description: formData.projectDesc,
        bullets: [
          `Built high-performance ${formData.projectName} utilizing ${formData.projectTech}.`,
          `${formData.projectDesc}`
        ]
      };
    }

    addActivity(newEntry);
    setToastMessage(isDraft ? 'Saved entry as draft' : 'Added to your Unified Activity Feed!');

    setTimeout(() => {
      navigate('/feed');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/feed')}
          className="p-2 rounded-xl bg-darkCard border border-darkBorder text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Add Achievement / Experience</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured entries are instantly transformed into ATS bullet points for your living resume.
          </p>
        </div>
      </div>

      {/* Type Selector Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Step 1: Choose Entry Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {types.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/80 to-darkCard border-indigo-500 shadow-glow-primary'
                    : 'bg-darkCard/70 border-darkBorder/80 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl w-fit mb-2 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-darkBg text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.label}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Tailored Dynamic Form */}
      <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-4">
        <div className="pb-3 border-b border-darkBorder flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            {types.find(t => t.id === selectedType)?.label} Details
          </h3>
          <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI will write ATS bullets
          </span>
        </div>

        {/* Hackathon Form */}
        {selectedType === 'hackathon' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hackathon Name</label>
                <input
                  type="text"
                  value={formData.hackathonName}
                  onChange={(e) => setFormData({ ...formData, hackathonName: e.target.value })}
                  placeholder="e.g. HackMIT 2024"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Track / Theme</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="e.g. Autonomous AI Track"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="text"
                  value={formData.hackDate}
                  onChange={(e) => setFormData({ ...formData, hackDate: e.target.value })}
                  placeholder="Oct 2024"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Team Size</label>
                <input
                  type="text"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  placeholder="4 developers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Outcome / Prize</label>
                <input
                  type="text"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="1st Place Overall Winner"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Brief Description / Architecture</label>
              <textarea
                rows={3}
                value={formData.hackDesc}
                onChange={(e) => setFormData({ ...formData, hackDesc: e.target.value })}
                placeholder="What did your team engineer? Tech stack and metrics achieved."
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Course Form */}
        {selectedType === 'course' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                >
                  <option value="Coursera">Coursera</option>
                  <option value="edX">edX</option>
                  <option value="Infosys Springboard">Infosys Springboard</option>
                  <option value="Udacity Nanodegree">Udacity Nanodegree</option>
                  <option value="MIT OpenCourseWare">MIT OpenCourseWare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Completion Date</label>
                <input
                  type="text"
                  value={formData.completionDate}
                  onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Certificate PDF / Link (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://coursera.org/verify/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Skills & Key Learnings</label>
              <textarea
                rows={3}
                value={formData.courseDesc}
                onChange={(e) => setFormData({ ...formData, courseDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Internship Form */}
        {selectedType === 'internship' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Key Contributions & Measurable Impact</label>
              <textarea
                rows={3}
                value={formData.internDesc}
                onChange={(e) => setFormData({ ...formData, internDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Project Form */}
        {selectedType === 'project' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Technologies Used</label>
                <input
                  type="text"
                  value={formData.projectTech}
                  onChange={(e) => setFormData({ ...formData, projectTech: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project Summary</label>
              <textarea
                rows={3}
                value={formData.projectDesc}
                onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Position of Responsibility Form */}
        {selectedType === 'responsibility' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role / Position</label>
                <input
                  type="text"
                  value={formData.leadTitle}
                  onChange={(e) => setFormData({ ...formData, leadTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Club / Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Key Outcomes & Initiatives</label>
              <textarea
                rows={3}
                value={formData.respDesc}
                onChange={(e) => setFormData({ ...formData, respDesc: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Submission CTAs */}
        <div className="pt-4 border-t border-darkBorder/60 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-darkBg border border-darkBorder hover:border-slate-700 text-slate-300 text-xs font-semibold"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save & Add to Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
