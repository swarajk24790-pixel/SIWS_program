import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

const EMPTY_TIMETABLE = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
const userStorageKey = (id) => `unipilot_user_${id}`;
const timetableStorageKey = (id) => `unipilot_timetable_${id}`;

// Pre-seeded mock student profiles available for Parent/Teacher portal & switching
export const SAMPLE_STUDENTS = [
  {
    id: 'student-1',
    name: 'Swaraj K.',
    email: 'swaraj@siws.edu',
    college: 'SIWS College of Science & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: 'Semester 5',
    gpa: '8.84 CGPA',
    tagline: 'Undergrad • CS & Engineering',
    github: 'swarajk24790-pixel',
    linkedin: 'linkedin.com/in/swaraj-k',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    rollNo: 'CS-2022-042',
    parentContact: 'Mrs. K. (Parent)',
    attendancePct: 82.4,
    attendanceStatus: 'On Track (Safe)',
    attendance: [
      { id: 'att-1', name: 'Distributed Systems', code: 'CS 301', attended: 26, held: 30, percentage: 86.7, required: 75, status: 'safe', faculty: 'Dr. Vaswani' },
      { id: 'att-2', name: 'Database Management', code: 'CS 305', attended: 20, held: 28, percentage: 71.4, required: 75, status: 'critical', faculty: 'Prof. Miller' },
      { id: 'att-3', name: 'Artificial Intelligence', code: 'CS 312', attended: 22, held: 24, percentage: 91.7, required: 75, status: 'safe', faculty: 'Prof. Chen' },
      { id: 'att-4', name: 'Computer Networks', code: 'CS 318', attended: 18, held: 22, percentage: 81.8, required: 75, status: 'warning', faculty: 'Dr. Tanenbaum' }
    ],
    activities: [
      { id: 'act-1', title: 'ETHIndia 2024 Finalist', type: 'hackathon', date: 'November 2024', subtitle: 'Web3 & AI Track • Arbitrum' },
      { id: 'act-2', title: 'AWS Cloud Solutions Architect', type: 'certification', date: 'August 2024', subtitle: 'Amazon Web Services • Credly' },
      { id: 'act-3', title: 'Vice President & Head of AI', type: 'leadership', date: 'Aug 2023 - Present', subtitle: 'Developer Student Club' }
    ],
    timetable: {
      Monday: [
        { id: 1, time: '09:00 - 10:15 AM', code: 'CS 301', name: 'Distributed Systems', room: 'Hall 402', prof: 'Prof. Chen' },
        { id: 2, time: '10:30 - 11:45 AM', code: 'CS 305', name: 'Database Management', room: 'Lab 3B', prof: 'Prof. Miller' }
      ],
      Tuesday: [
        { id: 3, time: '01:30 - 02:45 PM', code: 'CS 312', name: 'Artificial Intelligence', room: 'Hall 108', prof: 'Dr. Vaswani' }
      ],
      Wednesday: [
        { id: 4, time: '09:00 - 10:15 AM', code: 'CS 301', name: 'Distributed Systems', room: 'Hall 402', prof: 'Prof. Chen' },
        { id: 5, time: '03:15 - 04:30 PM', code: 'CS 318', name: 'Computer Networks', room: 'Lab 2A', prof: 'Dr. Tanenbaum' }
      ],
      Thursday: [
        { id: 6, time: '10:30 - 11:45 AM', code: 'CS 305', name: 'Database Management', room: 'Lab 3B', prof: 'Prof. Miller' }
      ],
      Friday: [
        { id: 7, time: '01:30 - 02:45 PM', code: 'CS 312', name: 'Artificial Intelligence', room: 'Hall 108', prof: 'Dr. Vaswani' }
      ]
    }
  },
  {
    id: 'student-2',
    name: 'Aanya Sharma',
    email: 'aanya.sharma@siws.edu',
    college: 'SIWS College of Science & Technology',
    course: 'B.Tech Information Technology',
    semester: 'Semester 5',
    gpa: '9.20 CGPA',
    tagline: 'Undergrad • IT & Cloud Systems',
    github: 'aanya-sharma',
    linkedin: 'linkedin.com/in/aanya-sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    rollNo: 'IT-2022-015',
    parentContact: 'Mr. Sharma (Parent)',
    attendancePct: 91.5,
    attendanceStatus: 'Excellent (All > 85%)',
    attendance: [
      { id: 'att-21', name: 'Cloud Computing & DevOps', code: 'IT 302', attended: 28, held: 30, percentage: 93.3, required: 75, status: 'safe', faculty: 'Dr. Rao' },
      { id: 'att-22', name: 'Data Structures & Algorithms', code: 'IT 304', attended: 27, held: 28, percentage: 96.4, required: 75, status: 'safe', faculty: 'Prof. Joshi' },
      { id: 'att-23', name: 'Full-Stack Web Engineering', code: 'IT 308', attended: 21, held: 24, percentage: 87.5, required: 75, status: 'safe', faculty: 'Prof. Verma' }
    ],
    activities: [
      { id: 'act-21', title: 'Smart India Hackathon 2024 Winner', type: 'hackathon', date: 'October 2024', subtitle: 'Ministry of Education • 1st Prize' },
      { id: 'act-22', title: 'Google Cloud Certified Associate', type: 'certification', date: 'July 2024', subtitle: 'Google Cloud Platform' }
    ],
    timetable: {
      Monday: [
        { id: 21, time: '10:00 - 11:15 AM', code: 'IT 302', name: 'Cloud Computing', room: 'Hall 201', prof: 'Dr. Rao' }
      ],
      Tuesday: [
        { id: 22, time: '11:30 - 12:45 PM', code: 'IT 304', name: 'DSA Lab', room: 'Lab 4A', prof: 'Prof. Joshi' }
      ],
      Wednesday: [
        { id: 23, time: '02:00 - 03:15 PM', code: 'IT 308', name: 'Web Dev', room: 'Hall 305', prof: 'Prof. Verma' }
      ],
      Thursday: [
        { id: 24, time: '10:00 - 11:15 AM', code: 'IT 302', name: 'Cloud Computing', room: 'Hall 201', prof: 'Dr. Rao' }
      ],
      Friday: [
        { id: 25, time: '01:30 - 02:45 PM', code: 'IT 304', name: 'DSA Lecture', room: 'Hall 102', prof: 'Prof. Joshi' }
      ]
    }
  },
  {
    id: 'student-3',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@siws.edu',
    college: 'SIWS College of Science & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: 'Semester 5',
    gpa: '7.85 CGPA',
    tagline: 'Undergrad • Systems & Security',
    github: 'rohand-sec',
    linkedin: 'linkedin.com/in/rohan-deshmukh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    rollNo: 'CS-2022-078',
    parentContact: 'Mrs. Deshmukh (Parent)',
    attendancePct: 69.2,
    attendanceStatus: 'Action Required (< 75%)',
    attendance: [
      { id: 'att-31', name: 'Distributed Systems', code: 'CS 301', attended: 19, held: 30, percentage: 63.3, required: 75, status: 'critical', faculty: 'Dr. Vaswani' },
      { id: 'att-32', name: 'Database Management', code: 'CS 305', attended: 21, held: 28, percentage: 75.0, required: 75, status: 'warning', faculty: 'Prof. Miller' },
      { id: 'att-33', name: 'Network Security', code: 'CS 320', attended: 16, held: 24, percentage: 66.7, required: 75, status: 'critical', faculty: 'Dr. Tanenbaum' }
    ],
    activities: [
      { id: 'act-31', title: 'SIWS CyberSec Capture The Flag - 2nd Place', type: 'competition', date: 'September 2024', subtitle: 'CyberSecurity Club' }
    ],
    timetable: {
      Monday: [
        { id: 31, time: '09:00 - 10:15 AM', code: 'CS 301', name: 'Distributed Systems', room: 'Hall 402', prof: 'Prof. Chen' }
      ],
      Tuesday: [
        { id: 32, time: '10:30 - 11:45 AM', code: 'CS 305', name: 'Database Management', room: 'Lab 3B', prof: 'Prof. Miller' }
      ],
      Wednesday: [
        { id: 33, time: '03:15 - 04:30 PM', code: 'CS 320', name: 'Network Security', room: 'Lab 2A', prof: 'Dr. Tanenbaum' }
      ],
      Thursday: [
        { id: 34, time: '09:00 - 10:15 AM', code: 'CS 301', name: 'Distributed Systems', room: 'Hall 402', prof: 'Prof. Chen' }
      ],
      Friday: [
        { id: 35, time: '10:30 - 11:45 AM', code: 'CS 305', name: 'Database Management', room: 'Lab 3B', prof: 'Prof. Miller' }
      ]
    }
  }
];

function toClientUser(profile) {
  return {
    id: profile.id, 
    name: profile.name, 
    email: profile.email,
    college: profile.college || 'SIWS College of Science & Technology',
    course: profile.course || 'B.Tech Computer Science & Engineering',
    semester: profile.semester || 'Semester 5',
    gpa: `${profile.cgpa ?? 8.84} CGPA`, 
    github: profile.github || '', 
    linkedin: profile.linkedin || '',
    tagline: `${profile.course || 'Computer Science'} • ${profile.college || 'SIWS College'}`,
    avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  };
}

export function AppProvider({ children }) {
  const [activities, setActivities] = useState(() => SAMPLE_STUDENTS[0].activities);
  const [attendance, setAttendance] = useState(() => SAMPLE_STUDENTS[0].attendance);
  const [assignments, setAssignments] = useState([]);
  const [hasNewActivityForResume, setHasNewActivityForResume] = useState(false);
  const [lastResumeSync, setLastResumeSync] = useState('Today at 10:15 AM');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState('hackathon');
  const [compiledResume, setCompiledResume] = useState(null);
  const [compiledPortfolio, setCompiledPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Portal Role: 'student' | 'guardian' (parent or teacher)
  const [portalRole, setPortalRole] = useState(() => {
    return localStorage.getItem('unipilot_portal_role') || 'student';
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'DBMS Attendance Alert', desc: 'Current: 71.4%. Below 75% cutoff — attend class today.', type: 'warning', time: '10m ago', read: false },
    { id: 2, title: 'Upcoming Deadline', desc: 'Raft Log Compaction is due tomorrow at 11:59 PM.', type: 'urgent', time: '1h ago', read: false },
    { id: 3, title: 'GitHub Sync Complete', desc: 'Repositories synced and verified with ATS bullet points.', type: 'info', time: '3h ago', read: true }
  ]);

  // Active student user being viewed on dashboard
  const [user, setUser] = useState(() => {
    const activeUserId = localStorage.getItem('unipilot_active_user_id');
    const match = SAMPLE_STUDENTS.find(s => s.id === activeUserId);
    if (match) return match;
    const saved = activeUserId && localStorage.getItem(userStorageKey(activeUserId));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_STUDENTS[0];
  });

  // Timetable state
  const [timetable, setTimetable] = useState(() => {
    return SAMPLE_STUDENTS[0].timetable;
  });

  // Function to switch active student (used by Parents/Teachers to inspect any student)
  const selectStudent = (studentId) => {
    const found = SAMPLE_STUDENTS.find(s => s.id === studentId);
    if (found) {
      setUser(found);
      setAttendance(found.attendance || []);
      setActivities(found.activities || []);
      setTimetable(found.timetable || EMPTY_TIMETABLE);
      localStorage.setItem('unipilot_active_user_id', found.id);
      localStorage.setItem(userStorageKey(found.id), JSON.stringify(found));
    }
  };

  const loginAsRole = (role, studentId = null) => {
    setPortalRole(role);
    localStorage.setItem('unipilot_portal_role', role);
    setIsAuthenticated(true);
    localStorage.setItem('unipilot_token', `token_${role}_${Date.now()}`);
    if (studentId) {
      selectStudent(studentId);
    } else {
      selectStudent(SAMPLE_STUDENTS[0].id);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res && res.access_token) {
        localStorage.setItem('unipilot_token', res.access_token);
        setIsAuthenticated(true);
        setPortalRole('student');
        localStorage.setItem('unipilot_portal_role', 'student');
        if (res.user) {
          const u = toClientUser(res.user);
          setUser(u);
          localStorage.setItem('unipilot_active_user_id', res.user.id);
          localStorage.setItem(userStorageKey(res.user.id), JSON.stringify(u));
        }
        await loadUserData();
        return res;
      }
    } catch (e) {
      // Local seamless fallback
      const studentMatch = SAMPLE_STUDENTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || SAMPLE_STUDENTS[0];
      loginAsRole('student', studentMatch.id);
      return { success: true, user: studentMatch };
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const res = await api.register(name, email, password);
      if (res && res.access_token) {
        localStorage.setItem('unipilot_token', res.access_token);
        setIsAuthenticated(true);
        setPortalRole('student');
        localStorage.setItem('unipilot_portal_role', 'student');
        if (res.user) {
          const u = toClientUser(res.user);
          setUser(u);
          localStorage.setItem('unipilot_active_user_id', res.user.id);
          localStorage.setItem(userStorageKey(res.user.id), JSON.stringify(u));
        }
        await loadUserData();
        return res;
      }
    } catch (e) {
      // Local fallback
      const newStudent = {
        id: `student-${Date.now()}`,
        name: name || 'New Student',
        email: email,
        college: 'SIWS College of Science & Technology',
        course: 'Computer Science & Engineering',
        semester: 'Semester 1',
        gpa: '8.50 CGPA',
        tagline: 'Undergrad • Engineering',
        github: '',
        linkedin: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        attendance: SAMPLE_STUDENTS[0].attendance,
        activities: [],
        timetable: EMPTY_TIMETABLE
      };
      SAMPLE_STUDENTS.unshift(newStudent);
      setUser(newStudent);
      setIsAuthenticated(true);
      setPortalRole('student');
      localStorage.setItem('unipilot_token', `token_reg_${Date.now()}`);
      localStorage.setItem('unipilot_active_user_id', newStudent.id);
      return { success: true, user: newStudent };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('unipilot_token');
    localStorage.removeItem('unipilot_active_user_id');
    localStorage.removeItem('unipilot_portal_role');
    setPortalRole('student');
    setUser(SAMPLE_STUDENTS[0]);
    setAttendance(SAMPLE_STUDENTS[0].attendance);
    setActivities(SAMPLE_STUDENTS[0].activities);
    setTimetable(SAMPLE_STUDENTS[0].timetable);
  };

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const attData = await api.getAttendance().catch(() => null);
      if (attData && attData.length > 0) setAttendance(attData);

      const acts = await api.getActivities().catch(() => null);
      if (acts && acts.length > 0) setActivities(acts);

      const resumeRes = await api.compileResume().catch(() => null);
      if (resumeRes) setCompiledResume(resumeRes);

      const portRes = await api.compilePortfolio().catch(() => null);
      if (portRes) setCompiledPortfolio(portRes);
    } catch (err) {
      console.warn('Data sync notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (item) => {
    const tempId = `act-${Date.now()}`;
    const newEntry = { ...item, id: tempId, verified: true };
    setActivities(prev => [newEntry, ...prev]);
    setHasNewActivityForResume(true);
    try {
      const saved = await api.addActivity(item);
      if (saved && saved.id) {
        setActivities(prev => prev.map(a => a.id === tempId ? saved : a));
      }
    } catch (e) {}
  };

  const deleteActivity = async (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setHasNewActivityForResume(true);
    try { await api.deleteActivity(id); } catch (e) {}
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const regenerateResume = async () => {
    try {
      const updated = await api.compileResume();
      setCompiledResume(updated);
      setHasNewActivityForResume(false);
      setLastResumeSync('Just now');
    } catch (e) {}
  };

  const toggleAssignmentStatus = (id) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  return (
    <AppContext.Provider value={{
      activities,
      setActivities,
      addActivity,
      deleteActivity,
      attendance,
      setAttendance,
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
      portalRole,
      setPortalRole,
      SAMPLE_STUDENTS,
      selectStudent,
      loginAsRole,
      loginUser,
      registerUser,
      logoutUser,
      timetable,
      setTimetable,
      loadUserData,
      compiledResume,
      compiledPortfolio,
      isLoading,
      isAuthenticated,
      setIsAuthenticated
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
