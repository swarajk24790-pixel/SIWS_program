import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

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
    tagline: `${profile.course || 'Computer Science'} • ${profile.college || 'University Campus'}`,
    avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  };
}

export function AppProvider({ children }) {
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [hasNewActivityForResume, setHasNewActivityForResume] = useState(false);
  const [lastResumeSync, setLastResumeSync] = useState('Today at 10:15 AM');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState('hackathon');
  const [compiledResume, setCompiledResume] = useState(null);
  const [compiledPortfolio, setCompiledPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Keep a saved session available while /auth/me verifies it on application startup.
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('unipilot_token'));

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'DBMS Attendance Alert', desc: 'Current: 71.4%. Below 75% cutoff — attend class today.', type: 'warning', time: '10m ago', read: false },
    { id: 2, title: 'Upcoming Deadline', desc: 'Raft Log Compaction is due tomorrow at 11:59 PM.', type: 'urgent', time: '1h ago', read: false },
    { id: 3, title: 'GitHub Sync Complete', desc: 'Repositories synced and verified with ATS bullet points.', type: 'info', time: '3h ago', read: true }
  ]);

  // Stored active user or fallback template
  const [user, setUser] = useState(() => {
    const activeUserId = localStorage.getItem('unipilot_active_user_id');
    const saved = activeUserId && localStorage.getItem(userStorageKey(activeUserId));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Guest Student',
      tagline: 'Undergrad • Engineering & Applied Science',
      college: 'University Campus',
      course: 'Computer Science & Engineering',
      semester: 'Semester 1',
      gpa: '8.00 / 10.0',
      github: '',
      linkedin: '',
      email: 'student@university.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    };
  });

  // Timetable state stored dynamically per user
  const [timetable, setTimetable] = useState(() => {
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

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const token = localStorage.getItem('unipilot_token');
      if (token) {
        const profile = await api.getProfile().catch(() => null);
        if (profile && profile.id) {
          const u = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            college: profile.college || 'University Campus',
            course: profile.course || 'Computer Science & Engineering',
            semester: profile.semester || 'Semester 1',
            gpa: `${profile.cgpa || 8.0} CGPA`,
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            tagline: `${profile.course || 'Computer Science'} • ${profile.college || 'University Campus'}`,
            avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
          };
          setUser(u);
          localStorage.setItem('unipilot_active_user_id', profile.id);
          localStorage.setItem(userStorageKey(profile.id), JSON.stringify(u));
          const savedTimetable = localStorage.getItem(timetableStorageKey(profile.id));
          setTimetable(savedTimetable ? JSON.parse(savedTimetable) : EMPTY_TIMETABLE);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('unipilot_token');
          localStorage.removeItem('unipilot_active_user_id');
          setIsAuthenticated(false);
          return;
        }
      }

      // 2. Fetch Attendance
      const attData = await api.getAttendance().catch(() => []);
      if (attData && attData.length > 0) {
        setAttendance(attData);
      } else {
        setAttendance([]);
      }

      // 3. Fetch Activities
      const acts = await api.getActivities().catch(() => []);
      if (acts && acts.length > 0) {
        setActivities(acts);
      }

      // 4. Initial Resume & Portfolio Compile
      const resumeRes = await api.compileResume().catch(() => null);
      if (resumeRes) setCompiledResume(resumeRes);

      const portRes = await api.compilePortfolio().catch(() => null);
      if (portRes) setCompiledPortfolio(portRes);

    } catch (err) {
      console.warn('Backend load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('unipilot_token')) loadUserData();
    else setIsLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.access_token) {
      localStorage.setItem('unipilot_token', res.access_token);
      setIsAuthenticated(true);
      if (res.user) {
        const u = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          college: res.user.college || 'University Campus',
          course: res.user.course || 'Computer Science & Engineering',
          semester: res.user.semester || 'Semester 1',
          gpa: `${res.user.cgpa || 8.0} CGPA`,
          github: res.user.github || '',
          linkedin: res.user.linkedin || '',
          avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        };
        setUser(u);
        localStorage.setItem('unipilot_active_user_id', res.user.id);
        localStorage.setItem(userStorageKey(res.user.id), JSON.stringify(u));
      }
      await loadUserData();
      return res;
    }
    throw new Error('Login failed: invalid response token');
  };

  const registerUser = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res && res.access_token) {
      localStorage.setItem('unipilot_token', res.access_token);
      setIsAuthenticated(true);
      if (res.user) {
        const u = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          college: res.user.college || 'University Campus',
          course: res.user.course || 'Computer Science & Engineering',
          semester: res.user.semester || 'Semester 1',
          gpa: `${res.user.cgpa || 8.0} CGPA`,
          github: res.user.github || '',
          linkedin: res.user.linkedin || '',
          avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
        };
        setUser(u);
        localStorage.setItem('unipilot_active_user_id', res.user.id);
        localStorage.setItem(userStorageKey(res.user.id), JSON.stringify(u));
      }
      await loadUserData();
      return res;
    }
    throw new Error('Registration failed');
  };

  const enterAsGuest = (guestName = 'Guest Student') => {
    const dummyToken = 'guest_token_' + Date.now();
    localStorage.setItem('unipilot_token', dummyToken);
    const guestUser = {
      name: guestName,
      tagline: 'Undergrad • Engineering & Applied Science',
      college: 'SIWS College of Science & Technology',
      course: 'Computer Science & Engineering',
      semester: 'Semester 1',
      gpa: '8.50 / 10.0',
      github: '',
      linkedin: '',
      email: 'student@siws.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    };
    setUser(guestUser);
    localStorage.setItem('unipilot_user', JSON.stringify(guestUser));
    setIsAuthenticated(true);
    return guestUser;
  };

  const logoutUser = () => {
    localStorage.removeItem('unipilot_token');
    localStorage.removeItem('unipilot_active_user_id');
    setIsAuthenticated(false);
    setUser({
      name: 'Guest Student',
      tagline: 'Undergrad • Engineering & Applied Science',
      college: 'University Campus',
      course: 'Computer Science & Engineering',
      semester: 'Semester 1',
      gpa: '8.00 / 10.0',
      github: '',
      linkedin: '',
      email: 'student@university.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
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
    // Optimistic update
    setAttendance(prev => prev.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          attended: Math.max(0, sub.attended + attendedChange),
          held: Math.max(1, sub.held + heldChange)
        };
      }
      return sub;
    }));

    try {
      await api.logAttendance(id, attendedChange, heldChange);
    } catch (e) {
      console.warn('Could not persist attendance change to backend:', e);
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
      loginUser,
      registerUser,
      enterAsGuest,
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
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
