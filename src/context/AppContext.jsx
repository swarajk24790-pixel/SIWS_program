import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import defaultProfile from '../assets/default-profile.webp';

const AppContext = createContext();

export const DEFAULT_ATTENDANCE = [
  { id: 'cs301', name: 'Distributed Systems', code: 'CS 301', attended: 34, held: 40, required: 75, faculty: 'Prof. Chen' },
  { id: 'cs305', name: 'Database Management', code: 'CS 305', attended: 25, held: 35, required: 75, faculty: 'Prof. Miller' },
  { id: 'cs312', name: 'AI & Neural Nets', code: 'CS 312', attended: 36, held: 38, required: 75, faculty: 'Dr. Vaswani' },
  { id: 'cs318', name: 'Computer Networks', code: 'CS 318', attended: 29, held: 32, required: 75, faculty: 'Dr. Tanenbaum' },
];

export const DEFAULT_ASSIGNMENTS = [
  { id: 1, title: 'Raft Consensus Protocol Implementation', subject: 'CS 301 - Distributed Systems', dueDate: 'Tomorrow, 11:59 PM', priority: 'Urgent', status: 'In progress' },
  { id: 2, title: 'B-Tree Indexing Optimization Benchmark', subject: 'CS 305 - Database Systems', dueDate: 'In 3 days', priority: 'Medium', status: 'In progress' },
  { id: 3, title: 'Backprop Neural Net from Scratch', subject: 'CS 312 - AI & Neural Nets', dueDate: 'In 5 days', priority: 'Medium', status: 'Submitted' },
];

const EMPTY_TIMETABLE = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
const userStorageKey = (id) => `unipilot_user_${id}`;
const timetableStorageKey = (id) => `unipilot_timetable_${id}`;

function toClientUser(profile) {
  return {
    id: profile.id, name: profile.name, email: profile.email,
    college: profile.college || 'University Campus',
    course: profile.course || 'Computer Science & Engineering',
    semester: profile.semester || 'Semester 1',
    gpa: `${profile.cgpa ?? 8.0} CGPA`, github: profile.github || '', linkedin: profile.linkedin || '',
    tagline: `${profile.course || 'Computer Science'} â€¢ ${profile.college || 'University Campus'}`,
    avatar: profile.avatar || defaultProfile
  };
}

export function AppProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_attendance');
      return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE;
    } catch (e) {
      return DEFAULT_ATTENDANCE;
    }
  });
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_assignments');
      return saved ? JSON.parse(saved) : DEFAULT_ASSIGNMENTS;
    } catch (e) {
      return DEFAULT_ASSIGNMENTS;
    }
  });

  const [adminViewingStudent, setAdminViewingStudentState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('unipilot_admin_viewing_student');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const isAdmin = !!(sessionStorage.getItem('admin_token') || localStorage.getItem('unipilot_local_mode') === 'admin');

  const setAdminViewingStudent = (student) => {
    setAdminViewingStudentState(student);
    if (student) {
      try {
        sessionStorage.setItem('unipilot_admin_viewing_student', JSON.stringify(student));
        if (Array.isArray(student.subjects) && student.subjects.length > 0) {
          setAttendance(student.subjects);
        }
      } catch (e) {}
    } else {
      sessionStorage.removeItem('unipilot_admin_viewing_student');
    }
  };

  const clearAdminViewingStudent = () => {
    setAdminViewingStudentState(null);
    try {
      sessionStorage.removeItem('unipilot_admin_viewing_student');
      const saved = localStorage.getItem('unipilot_attendance');
      setAttendance(saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE);
    } catch (e) {}
  };
  const [hasNewActivityForResume, setHasNewActivityForResume] = useState(false);
  const [lastResumeSync, setLastResumeSync] = useState('Today at 10:15 AM');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState('hackathon');
  const [compiledResume, setCompiledResume] = useState(null);
  const [compiledPortfolio, setCompiledPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('unipilot_local_mode'));

  // Quiz results tracking
  const [quizResults, setQuizResults] = useState(() => {
    try {
      const saved = localStorage.getItem('unipilot_quiz_results');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'DBMS Attendance Alert', desc: 'Current: 71.4%. Below 75% cutoff â€” attend class today.', type: 'warning', time: '10m ago', read: false },
    { id: 2, title: 'Upcoming Deadline', desc: 'Raft Log Compaction is due tomorrow at 11:59 PM.', type: 'urgent', time: '1h ago', read: false },
    { id: 3, title: 'GitHub Sync Complete', desc: 'Repositories synced and verified with ATS bullet points.', type: 'info', time: '3h ago', read: true }
  ]);

  // Stored active user or fallback template
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem('unipilot_local_user');
    if (localUser) {
      try { return JSON.parse(localUser); } catch (e) {}
    }
    const activeUserId = localStorage.getItem('unipilot_active_user_id');
    const saved = activeUserId && localStorage.getItem(userStorageKey(activeUserId));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Guest Student',
      tagline: 'Undergrad â€¢ Engineering & Applied Science',
      college: 'University Campus',
      course: 'Computer Science & Engineering',
      semester: 'Semester 1',
      gpa: '8.00 / 10.0',
      github: '',
      linkedin: '',
      email: 'student@university.edu',
      avatar: defaultProfile
    };
  });

  // Timetable state stored dynamically per user
  const [timetable, setTimetable] = useState(() => {
    const localTimetable = localStorage.getItem('unipilot_local_timetable');
    if (localTimetable) {
      try { return JSON.parse(localTimetable); } catch (e) {}
    }
    const activeUserId = localStorage.getItem('unipilot_active_user_id');
    const saved = activeUserId && localStorage.getItem(timetableStorageKey(activeUserId));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
  });

  const loadUserData = async () => setIsLoading(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const startStudent = (profile, schedule = EMPTY_TIMETABLE) => {
    const localUser = {
      id: 'local-student',
      name: profile.name,
      email: '',
      college: profile.college,
      course: profile.course,
      age: profile.age,
      semester: profile.semester,
      gpa: 'â€”',
      github: '',
      linkedin: '',
      tagline: `${profile.course} â€¢ ${profile.college}`,
      avatar: defaultProfile
    };
    localStorage.setItem('unipilot_local_mode', 'student');
    localStorage.setItem('unipilot_local_user', JSON.stringify(localUser));
    localStorage.setItem('unipilot_local_timetable', JSON.stringify(schedule));
    setUser(localUser);
    setTimetable(schedule);
    setIsAuthenticated(true);
  };

  const startAdmin = () => {
    localStorage.setItem('unipilot_local_mode', 'admin');
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    localStorage.removeItem('unipilot_local_mode');
    localStorage.removeItem('unipilot_local_user');
    localStorage.removeItem('unipilot_local_timetable');
    setIsAuthenticated(false);
    setUser({
      name: 'Guest Student',
      tagline: 'Undergrad â€¢ Engineering & Applied Science',
      college: 'University Campus',
      course: 'Computer Science & Engineering',
      semester: 'Semester 1',
      gpa: '8.00 / 10.0',
      github: '',
      linkedin: '',
      instagram: '',
      email: 'student@university.edu',
      avatar: defaultProfile
    });
    setAttendance([]);
    setActivities([]);
    setTimetable({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] });
  };

  const addActivity = async (item) => {
    // Optimistic UI update
    const tempId = `act-${Date.now()}`;
    const newEntry = { ...item, id: tempId, verified: true };
    setActivities(prev => [newEntry, ...prev]);
    setHasNewActivityForResume(true);

    try {
      const saved = await api.addActivity(item);
      if (saved && saved.id) {
        setActivities(prev => prev.map(a => a.id === tempId ? saved : a));
      }
    } catch (e) {
      console.warn('Could not persist activity to backend:', e);
    }
  };

  const deleteActivity = async (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setHasNewActivityForResume(true);
    try {
      await api.deleteActivity(id);
    } catch (e) {
      console.warn('Could not delete activity on backend:', e);
    }
  };

  const regenerateResume = async () => {
    setHasNewActivityForResume(false);
    setLastResumeSync('Just now');
    try {
      const [res, port] = await Promise.all([
        api.compileResume(),
        api.compilePortfolio()
      ]);
      if (res) setCompiledResume(res);
      if (port) setCompiledPortfolio(port);
    } catch (e) {
      console.warn('Could not recompile resume via API:', e);
    }
  };

  const updateAttendance = async (id, attendedChange, heldChange) => {
    // Only administrators can add or modify attendance records
    if (!isAdmin) {
      console.warn('Students have view-only access to attendance.');
      return;
    }

    setAttendance(prev => {
      const updated = prev.map(sub => {
        if (sub.id === id) {
          const a = Math.max(0, sub.attended + attendedChange);
          const h = Math.max(1, sub.held + heldChange);
          return { ...sub, attended: a, held: h, percentage: Math.round((a / h) * 100) };
        }
        return sub;
      });
      try { localStorage.setItem('unipilot_attendance', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (adminViewingStudent) {
      await adminUpdateAttendance(adminViewingStudent.id, id, attendedChange, heldChange);
    }
  };

  const adminUpdateAttendance = async (studentId, subjectId, attendedDelta, heldDelta) => {
    const adminToken = sessionStorage.getItem('admin_token') || 'admin-unipilot-admin-2024';
    
    // Update active attendance view
    setAttendance(prev => {
      const updated = prev.map(sub => {
        if (sub.id === subjectId) {
          const a = Math.max(0, sub.attended + attendedDelta);
          const h = Math.max(1, sub.held + heldDelta);
          return { ...sub, attended: a, held: h, percentage: Math.round((a / h) * 100) };
        }
        return sub;
      });
      try { localStorage.setItem('unipilot_attendance', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Update viewing student cache if applicable
    if (adminViewingStudent && adminViewingStudent.id === studentId) {
      const updatedSubjects = (adminViewingStudent.subjects || []).map(s => {
        if (s.id === subjectId) {
          const a = Math.max(0, s.attended + attendedDelta);
          const h = Math.max(1, s.held + heldDelta);
          return { ...s, attended: a, held: h, percentage: Math.round((a / h) * 100) };
        }
        return s;
      });
      const updatedStudent = { ...adminViewingStudent, subjects: updatedSubjects };
      setAdminViewingStudentState(updatedStudent);
      try { sessionStorage.setItem('unipilot_admin_viewing_student', JSON.stringify(updatedStudent)); } catch (e) {}
    }

    try {
      await api.adminLogAttendance(studentId, subjectId, attendedDelta, heldDelta, adminToken);
    } catch (e) {
      console.warn('Backend admin log attendance failed:', e);
    }
  };

  const adminSetAttendance = async (studentId, subjectId, attended, held, required = 75) => {
    const adminToken = sessionStorage.getItem('admin_token') || 'admin-unipilot-admin-2024';

    setAttendance(prev => {
      const updated = prev.map(sub => {
        if (sub.id === subjectId) {
          const a = Math.max(0, attended);
          const h = Math.max(1, held);
          return { ...sub, attended: a, held: h, required, percentage: Math.round((a / h) * 100) };
        }
        return sub;
      });
      try { localStorage.setItem('unipilot_attendance', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (adminViewingStudent && adminViewingStudent.id === studentId) {
      const updatedSubjects = (adminViewingStudent.subjects || []).map(s => {
        if (s.id === subjectId) {
          const a = Math.max(0, attended);
          const h = Math.max(1, held);
          return { ...s, attended: a, held: h, required, percentage: Math.round((a / h) * 100) };
        }
        return s;
      });
      const updatedStudent = { ...adminViewingStudent, subjects: updatedSubjects };
      setAdminViewingStudentState(updatedStudent);
      try { sessionStorage.setItem('unipilot_admin_viewing_student', JSON.stringify(updatedStudent)); } catch (e) {}
    }

    try {
      await api.adminSetAttendance(studentId, subjectId, attended, held, required, adminToken);
    } catch (e) {
      console.warn('Backend admin set attendance failed:', e);
    }
  };

  const adminAddStudentSubject = async (studentId, subjectData) => {
    const adminToken = sessionStorage.getItem('admin_token') || 'admin-unipilot-admin-2024';
    const newSub = {
      id: subjectData.id || `sub-${Date.now()}`,
      name: subjectData.name,
      code: subjectData.code,
      attended: Number(subjectData.attended) || 0,
      held: Number(subjectData.held) || 1,
      required: Number(subjectData.required) || 75,
      faculty: subjectData.faculty || '',
      percentage: Math.round(((Number(subjectData.attended) || 0) / (Number(subjectData.held) || 1)) * 100)
    };

    setAttendance(prev => {
      const updated = [...prev, newSub];
      try { localStorage.setItem('unipilot_attendance', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    if (adminViewingStudent && adminViewingStudent.id === studentId) {
      const updatedSubjects = [...(adminViewingStudent.subjects || []), newSub];
      const updatedStudent = { ...adminViewingStudent, subjects: updatedSubjects };
      setAdminViewingStudentState(updatedStudent);
      try { sessionStorage.setItem('unipilot_admin_viewing_student', JSON.stringify(updatedStudent)); } catch (e) {}
    }

    try {
      await api.adminCreateSubject(studentId, subjectData, adminToken);
    } catch (e) {
      console.warn('Backend admin create subject failed:', e);
    }
  };

  const toggleAssignmentStatus = (id) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Submitted' ? 'In progress' : 'Submitted';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addQuizResult = (result) => {
    setQuizResults(prev => {
      const updated = [result, ...prev].slice(0, 20);
      try { localStorage.setItem('unipilot_quiz_results', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      activities,
      addActivity,
      deleteActivity,
      attendance,
      updateAttendance,
      assignments,
      toggleAssignmentStatus,
      hasNewActivityForResume,
      regenerateResume,
      lastResumeSync,
      quickAddOpen,
      setQuickAddOpen,
      quickAddDefaultType,
      setQuickAddDefaultType,
      notifications,
      markAllNotificationsRead,
      user,
      setUser,
      startStudent,
      startAdmin,
      logoutUser,
      timetable,
      setTimetable,
      loadUserData,
      compiledResume,
      compiledPortfolio,
      isLoading,
      isAuthenticated,
      setIsAuthenticated,
      quizResults,
      addQuizResult,
      isAdmin,
      adminViewingStudent,
      setAdminViewingStudent,
      clearAdminViewingStudent,
      adminUpdateAttendance,
      adminSetAttendance,
      adminAddStudentSubject
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}


