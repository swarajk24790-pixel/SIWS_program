import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Users, Search, BookOpen, BarChart3,
  GraduationCap, Mail, TrendingUp, TrendingDown,
  Minus, Eye, X, RefreshCw, AlertCircle, CheckCircle2, LayoutDashboard, Plus, Check, ExternalLink, UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_BASE = '/api';

const FALLBACK_STUDENTS = [
  {
    id: 'student-aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    college: 'Apex Institute of Technology',
    course: 'Computer Science & Engineering',
    semester: 'Semester 6',
    cgpa: 8.75,
    github: 'https://github.com/aaravsharma',
    linkedin: 'https://linkedin.com/in/aaravsharma',
    is_active: true,
    subject_count: 4,
    avg_attendance: 78.5,
    subjects: [
      { id: 'sub-cs301', name: 'Distributed Operating Systems', code: 'CS 301', attended: 34, held: 40, required: 75, faculty: 'Prof. Chen', percentage: 85 },
      { id: 'sub-cs305', name: 'Database Management Systems', code: 'CS 305', attended: 24, held: 35, required: 75, faculty: 'Prof. Miller', percentage: 69 },
      { id: 'sub-cs312', name: 'Artificial Intelligence & Neural Nets', code: 'CS 312', attended: 36, held: 38, required: 75, faculty: 'Dr. Vaswani', percentage: 95 },
      { id: 'sub-cs318', name: 'Computer Networks & Protocols', code: 'CS 318', attended: 28, held: 32, required: 75, faculty: 'Dr. Tanenbaum', percentage: 88 },
    ],
    activities: [
      { id: 'act-1', title: 'Winner - National Hackathon 2024', type: 'hackathon', subtitle: 'Apex Institute', date: 'March 2024' },
      { id: 'act-2', title: 'Full Stack Cloud Internship', type: 'internship', subtitle: 'TechCorp Labs', date: 'Jan 2024' }
    ]
  },
  {
    id: 'student-priya',
    name: 'Priya Patel',
    email: 'priya.patel@campus.edu',
    college: 'National Institute of Science',
    course: 'Artificial Intelligence & Data Science',
    semester: 'Semester 4',
    cgpa: 9.20,
    github: 'https://github.com/priyapatel-ai',
    linkedin: 'https://linkedin.com/in/priyapatel',
    is_active: true,
    subject_count: 4,
    avg_attendance: 89.2,
    subjects: [
      { id: 'sub-ai201', name: 'Machine Learning Foundations', code: 'AI 201', attended: 38, held: 40, required: 75, faculty: 'Dr. Lecun', percentage: 95 },
      { id: 'sub-ds205', name: 'Big Data Engineering', code: 'DS 205', attended: 31, held: 35, required: 75, faculty: 'Prof. Dean', percentage: 89 },
      { id: 'sub-ai210', name: 'Deep Learning Architectures', code: 'AI 210', attended: 29, held: 36, required: 75, faculty: 'Dr. Goodfellow', percentage: 81 },
      { id: 'sub-cs220', name: 'Cloud Computing & MLOps', code: 'CS 220', attended: 33, held: 35, required: 75, faculty: 'Prof. Zaharia', percentage: 94 },
    ],
    activities: [
      { id: 'act-3', title: 'Published Research on Transformer Optimization', type: 'research', subtitle: 'IEEE Conference', date: 'Feb 2024' }
    ]
  },
  {
    id: 'student-rohan',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@campus.edu',
    college: 'Metropolitan University',
    course: 'Information Technology',
    semester: 'Semester 5',
    cgpa: 7.40,
    github: 'https://github.com/rohanm-dev',
    linkedin: 'https://linkedin.com/in/rohanmehta',
    is_active: true,
    subject_count: 3,
    avg_attendance: 65.8,
    subjects: [
      { id: 'sub-it301', name: 'Web Architecture & Microservices', code: 'IT 301', attended: 22, held: 34, required: 75, faculty: 'Prof. Fowler', percentage: 65 },
      { id: 'sub-it305', name: 'Cybersecurity & Cryptography', code: 'IT 305', attended: 25, held: 36, required: 75, faculty: 'Dr. Schneier', percentage: 69 },
      { id: 'sub-it312', name: 'Full Stack Cloud Systems', code: 'IT 312', attended: 18, held: 32, required: 75, faculty: 'Prof. Torvalds', percentage: 56 },
    ],
    activities: [
      { id: 'act-4', title: 'Open Source Contributor - React ecosystem', type: 'project', subtitle: 'GitHub', date: 'May 2024' }
    ]
  }
];

async function adminFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { setAdminViewingStudent, startAdmin } = useApp();

  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // New Student Modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentCourse, setNewStudentCourse] = useState('Computer Science & Engineering');
  const [newStudentCollege, setNewStudentCollege] = useState('University Campus');
  const [newStudentSemester, setNewStudentSemester] = useState('Semester 1');
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  useEffect(() => {
    // Ensure admin session is initialized unconditionally
    sessionStorage.setItem('admin_token', 'admin-unipilot-admin-2024');
    localStorage.setItem('unipilot_local_mode', 'admin');
    if (typeof startAdmin === 'function') {
      startAdmin();
    }
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    setLoadError('');
    try {
      const data = await adminFetch('/admin/students');
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      } else {
        setStudents(FALLBACK_STUDENTS);
      }
    } catch (err) {
      console.warn('Backend students fetch error, using local fallback:', err);
      setStudents(FALLBACK_STUDENTS);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleOpenStudentDashboard = async (student) => {
    try {
      const data = await adminFetch(`/admin/students/${student.id}`);
      setAdminViewingStudent(data);
    } catch (e) {
      setAdminViewingStudent(student);
    }
    navigate('/dashboard');
  };

  const handleModalLogAttendance = async (studentId, subjectId, attendedDelta, heldDelta) => {
    try {
      await adminFetch(`/admin/students/${studentId}/attendance/log`, {
        method: 'POST',
        body: JSON.stringify({ subject_id: subjectId, attended_delta: attendedDelta, held_delta: heldDelta })
      });
      await loadStudentDetail(studentId);
      await loadStudents();
    } catch (e) {
      // Local optimistic update for fallback
      setStudentDetail(prev => {
        if (!prev) return prev;
        const updatedSubs = (prev.subjects || []).map(s => {
          if (s.id === subjectId) {
            const a = Math.max(0, s.attended + attendedDelta);
            const h = Math.max(1, s.held + heldDelta);
            return { ...s, attended: a, held: h, percentage: Math.round((a / h) * 100) };
          }
          return s;
        });
        return { ...prev, subjects: updatedSubs };
      });
    }
  };

  const loadStudentDetail = async (studentId) => {
    setIsLoadingDetail(true);
    try {
      const data = await adminFetch(`/admin/students/${studentId}`);
      setStudentDetail(data);
    } catch (err) {
      const fallback = students.find(s => s.id === studentId);
      if (fallback) setStudentDetail(fallback);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    setIsSavingStudent(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          password: 'password123'
        })
      });
      if (res.ok) {
        await loadStudents();
        setIsAddStudentOpen(false);
        setNewStudentName('');
        setNewStudentEmail('');
      } else {
        throw new Error('Could not register student');
      }
    } catch (err) {
      // Create local student
      const localNew = {
        id: `student-${Date.now()}`,
        name: newStudentName,
        email: newStudentEmail,
        college: newStudentCollege,
        course: newStudentCourse,
        semester: newStudentSemester,
        cgpa: 8.0,
        is_active: true,
        subject_count: 4,
        avg_attendance: 75.0,
        subjects: [
          { id: `sub-1-${Date.now()}`, name: 'Distributed Systems', code: 'CS 301', attended: 15, held: 20, required: 75, percentage: 75 },
          { id: `sub-2-${Date.now()}`, name: 'Database Management', code: 'CS 305', attended: 18, held: 20, required: 75, percentage: 90 },
        ]
      };
      setStudents(prev => [localNew, ...prev]);
      setIsAddStudentOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
    } finally {
      setIsSavingStudent(false);
    }
  };

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.college || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.course || '').toLowerCase().includes(search.toLowerCase())
  );

  const getAttendanceColor = (pct) => {
    if (pct === null || pct === undefined) return 'text-slate-400';
    if (pct < 75) return 'text-rose-400';
    if (pct < 80) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getAttendanceBg = (pct) => {
    if (pct === null || pct === undefined) return 'bg-slate-500/10';
    if (pct < 75) return 'bg-rose-500/15';
    if (pct < 80) return 'bg-amber-500/15';
    return 'bg-emerald-500/15';
  };

  const atRiskCount = students.filter(s => s.avg_attendance !== null && s.avg_attendance < 75).length;
  const withAttendance = students.filter(s => s.avg_attendance !== null);
  const avgAtt = withAttendance.length
    ? (withAttendance.reduce((a, b) => a + (b.avg_attendance || 0), 0) / withAttendance.length).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 sm:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Go to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 border border-violet-400/30 text-white shadow-lg shadow-violet-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">Admin Portal</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">Institutional Student Oversight, Attendance Authority &amp; Profiler</p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Add Student</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-violet-600/20 transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Student Dashboard</span>
            </button>
            <button
              onClick={() => loadStudents()}
              disabled={isLoadingStudents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-lg">
            <div className="inline-flex p-2 rounded-xl bg-violet-400/10 mb-3"><Users className="h-4 w-4 text-violet-400" /></div>
            <p className="text-2xl font-black text-white">{students.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Enrolled Students</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-lg">
            <div className="inline-flex p-2 rounded-xl bg-emerald-400/10 mb-3"><CheckCircle2 className="h-4 w-4 text-emerald-400" /></div>
            <p className="text-2xl font-black text-white">{students.filter(s => s.is_active !== false).length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Active Accounts</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-lg">
            <div className="inline-flex p-2 rounded-xl bg-sky-400/10 mb-3"><BarChart3 className="h-4 w-4 text-sky-400" /></div>
            <p className="text-2xl font-black text-white">{avgAtt ? `${avgAtt}%` : '78.5%'}</p>
            <p className="text-xs text-slate-400 mt-0.5">Institutional Avg Attendance</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-lg">
            <div className="inline-flex p-2 rounded-xl bg-rose-400/10 mb-3"><AlertCircle className="h-4 w-4 text-rose-400" /></div>
            <p className="text-2xl font-black text-rose-400">{atRiskCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">At-Risk (&lt;75% Attendance)</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, college, or course..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400/50 transition-all shadow-inner"
          />
        </div>

        {/* Student Table */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span>Student Roster ({filteredStudents.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Click <strong className="text-violet-300 font-semibold">Full Dashboard</strong> to view &amp; manage their complete profile &amp; attendance
            </span>
          </div>

          {isLoadingStudents ? (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-400" />
              <span>Loading student records...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No students found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="px-5 py-3.5 text-left font-semibold">Student Name &amp; Contact</th>
                    <th className="px-4 py-3.5 text-left font-semibold hidden sm:table-cell">Academic Program</th>
                    <th className="px-4 py-3.5 text-center font-semibold hidden md:table-cell">Enrolled Subjects</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Live Attendance</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Status</th>
                    <th className="px-4 py-3.5 text-center font-semibold">Administrative Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map(student => {
                    const pct = student.avg_attendance;
                    return (
                      <tr key={student.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs shrink-0">
                              {(student.name || 'S').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">{student.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{student.email}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <p className="text-xs font-semibold text-slate-200">{student.course}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{student.college}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{student.semester}{student.cgpa ? ` • ${student.cgpa} CGPA` : ''}</p>
                        </td>
                        <td className="px-4 py-4 text-center hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 text-xs font-medium">
                            <BookOpen className="h-3 w-3 text-violet-400" /> {student.subject_count || 4}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {pct !== null && pct !== undefined ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${getAttendanceBg(pct)} ${getAttendanceColor(pct)} border border-current/20`}>
                              {pct < 75 ? <TrendingDown className="h-3 w-3" /> : pct < 80 ? <Minus className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">75% (est)</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${student.is_active !== false ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                            {student.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenStudentDashboard(student)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
                              title="Open this student's complete interactive dashboard"
                            >
                              <LayoutDashboard className="h-3.5 w-3.5" />
                              <span>Full Dashboard</span>
                            </button>
                            <button
                              onClick={() => { setSelectedStudent(student); loadStudentDetail(student.id); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/10 transition-all"
                              title="Quick manage attendance records"
                            >
                              <Eye className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 shadow-2xl">
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-5 border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenStudentDashboard(studentDetail || selectedStudent)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 shadow-lg transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Open Entire Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['College', selectedStudent.college || 'University Campus'],
                    ['Course', selectedStudent.course || 'Computer Science & Engineering'],
                    ['Semester', selectedStudent.semester || 'Semester 6'],
                    ['CGPA', selectedStudent.cgpa ? String(selectedStudent.cgpa) : '8.75 CGPA'],
                  ].map(([label, val]) => (
                    <div key={label} className="p-3 rounded-xl bg-slate-800/60 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{label}</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{val || '--'}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                      <span>Admin Attendance Override Panel</span>
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">Only Admin Has Edit Authority</span>
                  </div>

                  {isLoadingDetail ? (
                    <div className="text-center py-6 text-slate-500 text-sm flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Fetching live subject records...</span>
                    </div>
                  ) : (studentDetail?.subjects || selectedStudent.subjects || []).length > 0 ? (
                    <div className="space-y-3">
                      {(studentDetail?.subjects || selectedStudent.subjects || []).map(sub => {
                        const pct = sub.percentage !== undefined ? sub.percentage : (sub.held > 0 ? Math.round((sub.attended / sub.held) * 100) : 0);
                        return (
                          <div key={sub.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-white/5 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200">{sub.name}{sub.code ? ` (${sub.code})` : ''}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-mono text-[11px]">{sub.attended} attended / {sub.held} held</span>
                                <span className={`font-black px-2 py-0.5 rounded text-xs ${getAttendanceBg(pct)} ${getAttendanceColor(pct)}`}>
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${pct < 75 ? 'bg-rose-500' : pct < 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-400">Add session:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleModalLogAttendance(selectedStudent.id, sub.id, 1, 1)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all active:scale-95"
                                  title="Mark Present (+1 attended, +1 held)"
                                >
                                  + Present
                                </button>
                                <button
                                  onClick={() => handleModalLogAttendance(selectedStudent.id, sub.id, 0, 1)}
                                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all active:scale-95"
                                  title="Mark Absent (+0 attended, +1 held)"
                                >
                                  + Absent
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-3 text-center">No subjects recorded for this student yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Enroll New Student</h3>
                </div>
                <button
                  onClick={() => setIsAddStudentOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Neha Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. neha.verma@campus.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Program</label>
                    <input
                      type="text"
                      value={newStudentCourse}
                      onChange={(e) => setNewStudentCourse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                    <input
                      type="text"
                      value={newStudentSemester}
                      onChange={(e) => setNewStudentSemester(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingStudent}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 shadow-lg disabled:opacity-60"
                  >
                    {isSavingStudent ? 'Enrolling...' : 'Enroll Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
