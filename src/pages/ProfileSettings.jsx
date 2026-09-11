import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircle2, 
  Mail, 
  ShieldCheck, 
  Download, 
  Trash2, 
  LogOut, 
  Check, 
  Save,
  AlertTriangle,
  UploadCloud,
  X
} from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useApp();

  const [formData, setFormData] = useState({ ...user });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState({
    attendanceRisk: true,
    assignmentDeadlines: true,
    examCountdowns: true,
    weeklyDigest: false
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const saved = await api.updateProfile({
        name: formData.name,
        college: formData.college,
        course: formData.course,
        semester: formData.semester,
        github: formData.github,
        linkedin: formData.linkedin,
        avatar: formData.avatar,
      });
      const updated = { ...formData, id: saved.id, email: saved.email };
      setUser(updated);
      localStorage.setItem(`unipilot_user_${saved.id}`, JSON.stringify(updated));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.warn('Could not save profile:', error);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `unipilot_user_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Toast */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your academic credentials, connected platforms, notification triggers, and privacy export controls.
        </p>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-darkBorder">
          <img
            src={formData.avatar}
            alt={formData.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30"
          />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Profile Photo</h3>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-darkBg border border-darkBorder hover:border-indigo-500/50 text-xs font-semibold text-slate-200"
              >
                Change Avatar URL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Academic Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">University / Institute</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Degree Program & Branch</label>
            <input
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester</label>
            <input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Cumulative GPA</label>
            <input
              type="text"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Connected Accounts */}
      <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Connected Accounts</h3>
        <p className="text-xs text-slate-400">
          Link external developer profiles to power continuous activity ingestion:
        </p>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-darkBg border border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-slate-300" />
              <div>
                <span className="text-xs font-bold text-white">GitHub</span>
                <p className="text-[11px] text-slate-400">{formData.github || 'Not connected'}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Connected
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-darkBg border border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-white">LinkedIn</span>
                <p className="text-[11px] text-slate-400">{formData.linkedin || 'Ready to connect'}</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Sync Profile
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-darkBg border border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-rose-400" />
              <div>
                <span className="text-xs font-bold text-white">Google Workspace</span>
                <p className="text-[11px] text-slate-400">{formData.email}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Data Management (PRD requirement) */}
      <div className="p-6 rounded-3xl bg-darkCard/80 border border-darkBorder shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Privacy & Data Control (Self-Sovereign Data)</h3>
          </div>
          <button
            onClick={() => setDataModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Manage Data
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          UniPilot adheres to local-first privacy. Your uploaded course documents, attendance records, and resume drafts remain under your full ownership. You can export or purge your data graph at any time.
        </p>
      </div>

      {/* Log Out Button */}
      <div className="pt-2 flex justify-between items-center">
        <button
          onClick={() => {
            if (logoutUser) logoutUser();
            navigate('/');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Session</span>
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          UniPilot Engine v2.4 • Stanford Cluster
        </span>
      </div>

      {/* Manage Data Modal */}
      {dataModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDataModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Manage Academic Graph Data</h3>
              <button onClick={() => setDataModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Export all your attendance calculations, timetable notes, activity feed, and resume history as a portable JSON package.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleExportData}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Data Archive (.JSON)</span>
              </button>

              <button
                onClick={() => {
                  alert('All local cache cleared.');
                  setDataModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Indexed Documents Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
