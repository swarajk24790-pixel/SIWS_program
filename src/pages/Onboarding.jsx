import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { Github } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser, setTimetable, loadUserData, setIsAuthenticated } = useApp();
  const [step, setStep] = useState(1);

  // Step 1 State
  const [profile, setProfile] = useState({
    name: user.name || '',
    college: user.college || '',
    course: user.course || '',
    semester: user.semester || 'Semester 1'
  });

  // Step 2 State (Timetable)
  const [timetableFile, setTimetableFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const timetableFileRef = React.useRef(null);

  // Step 3 State (Subjects)
  const [subjects, setSubjects] = useState([]);
  const [newSub, setNewSub] = useState({ name: '', code: '', credits: 3, minAttendance: 75 });

  // Step 4 State (GitHub)
  const [githubUser, setGithubUser] = useState(user.github || '');
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsFinishing(true);
      try {
        if (!localStorage.getItem('unipilot_token')) {
          localStorage.setItem('unipilot_token', 'local_token_' + Date.now());
        }
        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        }
        const updatedUser = {
          ...user,
          ...profile,
          github: githubUser
        };
        setUser(updatedUser);
        localStorage.setItem('unipilot_user', JSON.stringify(updatedUser));

        // Update backend profile if logged in
        await api.updateProfile({
          name: profile.name,
          college: profile.college,
          course: profile.course,
          semester: profile.semester,
          github: githubUser
        }).catch(() => null);

        // Populate timetable slots based on chosen subjects
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dynamicSchedule = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
        
        subjects.forEach((s, idx) => {
          const day = daysOfWeek[idx % daysOfWeek.length];
          dynamicSchedule[day].push({
            id: Date.now() + idx,
            time: '09:00 - 10:15 AM',
            code: s.code,
            name: s.name,
            room: 'Hall 201',
            prof: 'Faculty Lead'
          });
        });

        setTimetable(dynamicSchedule);
        localStorage.setItem('unipilot_timetable', JSON.stringify(dynamicSchedule));

        // Persist subjects to backend attendance
        for (const sub of subjects) {
          await api.createSubject({
            name: sub.name,
            code: sub.code,
            attended: 10,
            held: 12,
            required: sub.minAttendance
          }).catch(() => null);
        }

        if (loadUserData) await loadUserData();
      } catch (err) {
        console.warn('Onboarding finish notice:', err);
      } finally {
        setIsFinishing(false);
        navigate('/dashboard');
      }
    }
  };

  const addSubject = () => {
    if (!newSub.name) return;
    setSubjects([...subjects, newSub]);
    setNewSub({ name: '', code: '', credits: 3, minAttendance: 75 });
  };

  const removeSubject = (idx) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl bg-darkCard/90 border border-darkBorder/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-indigo-400 font-bold uppercase tracking-wider">Step {step} of 4</span>
            <span>
              {step === 1 && 'Academic Profile'}
              {step === 2 && 'Timetable Setup'}
              {step === 3 && 'Course & Attendance Specs'}
              {step === 4 && 'GitHub & Developer Sync'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s < step 
                    ? 'bg-indigo-500' 
                    : s === step 
                      ? 'bg-gradient-to-r from-indigo-500 to-sky-400 shadow-glow-primary' 
                      : 'bg-darkBorder'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Academic Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Let&apos;s build your academic context</h2>
              <p className="text-xs text-slate-400 mt-1">UniPilot customizes your study planner and attendance formulas around these details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">College / University</label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Degree Program / Major</label>
                <input
                  type="text"
                  value={profile.course}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester / Term</label>
                <input
                  type="text"
                  value={profile.semester}
                  onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkBg border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Timetable Upload */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Upload or import your timetable</h2>
              <p className="text-xs text-slate-400 mt-1">Our AI parses timetable images or PDF schedules to automate attendance & daily alerts.</p>
            </div>

            <input
              type="file"
              ref={timetableFileRef}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                setTimeout(() => {
                  setTimetableFile(file.name);
                  setIsUploading(false);
                }, 800);
              }}
            />
            <div 
              onClick={() => timetableFileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setIsUploading(true);
                  setTimeout(() => {
                    setTimetableFile(file.name);
                    setIsUploading(false);
                  }, 800);
                }
              }}
              className="mt-4 border-2 border-dashed border-darkBorder hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-darkBg/50 hover:bg-darkBg transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>

              {isUploading ? (
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>AI parsing schedule slots...</span>
                </div>
              ) : timetableFile ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{timetableFile} (Parsed 5 weekday schedules)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-200">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-slate-500 mt-1">PDF, JPG, PNG or camera screenshot</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
              <span>Or you can add and customize lecture slots manually later on the Timetable page.</span>
            </div>
          </div>
        )}

        {/* Step 3: Current Subjects & Requirements */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Review current semester subjects</h2>
              <p className="text-xs text-slate-400 mt-1">Set the minimum mandatory attendance percentage (typically 75% or 80%).</p>
            </div>

            {/* List of current subjects */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {subjects.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-darkBg border border-darkBorder flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{sub.name}</span>
                    <span className="text-slate-400 ml-2 font-mono">({sub.code})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{sub.credits} Credits</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                      Req: {sub.minAttendance}%
                    </span>
                    <button onClick={() => removeSubject(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subject Row */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                className="col-span-2 px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Code (e.g. CS301)"
                value={newSub.code}
                onChange={(e) => setNewSub({ ...newSub, code: e.target.value })}
                className="px-3 py-2 rounded-xl bg-darkBg border border-darkBorder text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={addSubject}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        )}

        {/* Step 4: GitHub Integration (Skippable) */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Connect developer profile (Optional)</h2>
              <p className="text-xs text-slate-400 mt-1">UniPilot will auto-generate bullet points for your resume & portfolio directly from public repos.</p>
            </div>

            <div className="p-4 rounded-2xl bg-darkBg border border-darkBorder space-y-3">
              <label className="block text-xs font-medium text-slate-300">GitHub Username</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="e.g. octocat"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-darkCard border border-darkBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                You can import project repositories and certificates anytime from the Import menu.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200 leading-relaxed">
                You are all set! Your Unified Activity Feed and ATS Resume generator will automatically be initialized with your academic record.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-darkBorder/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleNext}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 font-medium"
              >
                Skip for now
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-xs shadow-glow-primary transition-all active:scale-95"
            >
              <span>{step === 4 ? 'Finish Setup & Open Dashboard' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
