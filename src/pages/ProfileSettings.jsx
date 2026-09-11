import React, { useRef, useState } from 'react';
import { AtSign, Check, Download, ImagePlus, LogOut, Save, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import defaultProfile from '../assets/default-profile.webp';
import { Github, Linkedin } from '../components/Icons';

const URL_FIELDS = [
  ['github', 'GitHub URL', 'https://github.com/your-name', Github, 'text-slate-200'],
  ['instagram', 'Instagram URL', 'https://instagram.com/your-name', AtSign, 'text-pink-300'],
  ['linkedin', 'LinkedIn URL', 'https://linkedin.com/in/your-name', Linkedin, 'text-sky-300'],
];

function validUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useApp();
  const [formData, setFormData] = useState({ ...user, avatar: user.avatar || defaultProfile, instagram: user.instagram || '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Choose an image smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setField('avatar', reader.result); setError(''); };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const urls = ['github', 'instagram', 'linkedin'];
    if (urls.some((field) => formData[field] && !validUrl(formData[field]))) {
      setError('Use complete URLs beginning with https:// for social links.');
      return;
    }
    const updated = { ...formData, avatar: formData.avatar || defaultProfile, tagline: `${formData.course} • ${formData.college}` };
    setUser(updated);
    localStorage.setItem('unipilot_local_user', JSON.stringify(updated));
    setSaveSuccess(true);
    setError('');
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const exportProfile = () => {
    const anchor = document.createElement('a');
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(formData, null, 2))}`;
    anchor.download = 'unipilot-profile.json';
    anchor.click();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      {saveSuccess && <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 p-4 text-xs font-bold text-white shadow-2xl"><Check className="h-4 w-4" /> Profile saved on this browser</div>}
      <div><h1 className="text-2xl font-extrabold text-white sm:text-3xl">Profile & Settings</h1><p className="mt-1 text-xs text-slate-400 sm:text-sm">Customize your local UniPilot profile. Social URLs are saved as links only; no accounts are connected.</p></div>

      <form onSubmit={saveProfile} className="space-y-6 rounded-3xl border border-darkBorder bg-darkCard/80 p-6 shadow-xl">
        <div className="flex flex-col gap-5 border-b border-darkBorder pb-5 sm:flex-row sm:items-center">
          <img src={formData.avatar || defaultProfile} onError={(event) => { event.currentTarget.src = defaultProfile; }} alt={formData.name || 'Student profile'} className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-500/30" />
          <div><h2 className="text-sm font-bold text-white">Profile photo</h2><p className="mt-1 text-xs text-slate-400">Upload an image from your device. The cat photo is used when none is selected.</p><input ref={fileInput} type="file" accept="image/*" onChange={choosePhoto} className="hidden" /><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-darkBorder bg-darkBg px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/60"><UploadCloud className="h-4 w-4" /> Upload photo</button><button type="button" onClick={() => setField('avatar', defaultProfile)} className="inline-flex items-center gap-2 rounded-xl border border-darkBorder bg-darkBg px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/60"><ImagePlus className="h-4 w-4" /> Use default</button></div></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[['name', 'Full name'], ['college', 'University / College'], ['course', 'Branch / Program'], ['semester', 'Semester'], ['age', 'Age'], ['gpa', 'CGPA']].map(([field, label]) => <label key={field}><span className="mb-1 block text-xs font-medium text-slate-300">{label}</span><input value={formData[field] || ''} type={field === 'age' ? 'number' : 'text'} onChange={(event) => setField(field, event.target.value)} className="w-full rounded-xl border border-darkBorder bg-darkBg px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500" /></label>)}
        </div>

        <section className="space-y-3 border-t border-darkBorder pt-5"><div><h2 className="text-sm font-bold text-white">Social profile links</h2><p className="mt-1 text-xs text-slate-400">Paste the URL you want displayed. UniPilot will only open it in a new tab.</p></div>{URL_FIELDS.map(([field, label, placeholder, Icon, color]) => { const url = validUrl(formData[field]); return <div key={field} className="rounded-2xl border border-darkBorder bg-darkBg p-3"><div className="flex items-center gap-3"><Icon className={`h-5 w-5 shrink-0 ${color}`} /><label className="min-w-0 flex-1"><span className="mb-1 block text-xs font-semibold text-white">{label}</span><input value={formData[field] || ''} onChange={(event) => setField(field, event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600" /></label>{url && <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/25">Open</a>}</div></div>; })}</section>

        {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</p>}
        <div className="flex flex-wrap justify-between gap-3 border-t border-darkBorder pt-5"><button type="button" onClick={exportProfile} className="inline-flex items-center gap-2 rounded-xl border border-darkBorder bg-darkBg px-4 py-2.5 text-xs font-semibold text-slate-200"><Download className="h-4 w-4" /> Export profile</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"><Save className="h-4 w-4" /> Save changes</button></div>
      </form>
      <button onClick={() => { logoutUser(); navigate('/'); }} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"><LogOut className="h-4 w-4" /> Start over</button>
    </div>
  );
}
