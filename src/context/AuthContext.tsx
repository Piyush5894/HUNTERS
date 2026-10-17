import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

export interface StudentCredentialRecord {
  user: User;
  passwordHash: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<AuthResponse>;
  loginWithEmail: (email: string, password?: string) => Promise<AuthResponse>;
  registerWithEmail: (data: {
    name: string;
    email: string;
    password?: string;
    college: string;
    branch: string;
    semester: number;
    rollNumber?: string;
  }) => Promise<AuthResponse>;
  resetPassword: (email: string, newPassword: string) => Promise<AuthResponse>;
  loginDemoStudent: (accountType?: 'nitk' | 'iitb' | 'dtu' | 'vtu') => void;
  loginDemoTopper: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isBookmarkSaved: (noteId: string) => boolean;
  toggleUserBookmark: (noteId: string) => void;
  rememberedEmail: string;
  setRememberedEmail: (email: string) => void;
}

// Pre-seeded verified student accounts with known email & passwords
export const PRE_SEEDED_STUDENTS: StudentCredentialRecord[] = [
  {
    passwordHash: 'password123',
    user: {
      id: 'student-nitk-1',
      name: 'Rahul Sharma',
      email: 'student@nitk.edu',
      college: 'National Institute of Technology Karnataka (NITK)',
      branch: 'CSE',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 340,
      savedNoteIds: ['note-1', 'note-3'],
      downloadedNoteIds: ['note-1'],
      upvotedNoteIds: ['note-1', 'note-2'],
      uploadedNoteIds: []
    }
  },
  {
    passwordHash: 'topper123',
    user: {
      id: 'topper-iitb-1',
      name: 'Priya Patel (9.8 CGPA Topper)',
      email: 'topper@iitb.ac.in',
      college: 'IIT Bombay Computer Science & Engg',
      branch: 'CSE',
      semester: 6,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'topper',
      reputationPoints: 1250,
      savedNoteIds: ['note-1', 'note-2', 'note-4'],
      downloadedNoteIds: ['note-1', 'note-2'],
      upvotedNoteIds: ['note-1', 'note-2', 'note-4'],
      uploadedNoteIds: ['note-1']
    }
  },
  {
    passwordHash: 'password123',
    user: {
      id: 'student-dtu-1',
      name: 'Arjun Verma',
      email: 'arjun@dtu.ac.in',
      college: 'Delhi Technological University (DTU)',
      branch: 'MECH',
      semester: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 520,
      savedNoteIds: ['note-4'],
      downloadedNoteIds: ['note-4'],
      upvotedNoteIds: ['note-4'],
      uploadedNoteIds: []
    }
  },
  {
    passwordHash: 'password123',
    user: {
      id: 'student-vtu-1',
      name: 'Ananya Rao',
      email: 'ananya@vtu.ac.in',
      college: 'BMS College of Engineering (VTU)',
      branch: 'ECE',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 410,
      savedNoteIds: ['note-2'],
      downloadedNoteIds: ['note-2'],
      upvotedNoteIds: ['note-2'],
      uploadedNoteIds: []
    }
  }
];

const CREDENTIALS_KEY = 'enginotes_student_accounts_v5';
const CURRENT_USER_KEY = 'enginotes_active_user_v5';
const REMEMBERED_EMAIL_KEY = 'enginotes_remembered_email';

function getStoredAccounts(): StudentCredentialRecord[] {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Initialize with pre-seeded accounts
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(PRE_SEEDED_STUDENTS));
  } catch {
    // ignore
  }
  return PRE_SEEDED_STUDENTS;
}

function saveStoredAccounts(accounts: StudentCredentialRecord[]) {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Default state: not logged in so the user can see and test the Login page with email & password!
    return null;
  });

  const [rememberedEmail, setRememberedEmailState] = useState<string>(() => {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) || 'student@nitk.edu';
    } catch {
      return 'student@nitk.edu';
    }
  });

  const setRememberedEmail = (email: string) => {
    setRememberedEmailState(email);
    try {
      if (email) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      // update stored account profile in credentials database too
      const accounts = getStoredAccounts();
      const idx = accounts.findIndex((a) => a.user.id === user.id || a.user.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        accounts[idx].user = user;
        saveStoredAccounts(accounts);
      }
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    const googleUser: User = {
      id: 'google-user-' + Date.now(),
      name: 'Google Verified Student',
      email: 'student.engineering@gmail.com',
      college: 'Delhi Technological University (DTU)',
      branch: 'CSE',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 240,
      savedNoteIds: ['note-1'],
      downloadedNoteIds: ['note-1'],
      upvotedNoteIds: ['note-1'],
      uploadedNoteIds: []
    };
    setUser(googleUser);
    return { success: true, user: googleUser, message: 'Signed in with Google successfully!' };
  };

  const loginWithEmail = async (email: string, password?: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your student email address.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Please enter your password.' };
    }

    const accounts = getStoredAccounts();
    const matchedRecord = accounts.find((a) => a.user.email.toLowerCase() === cleanEmail);

    if (matchedRecord) {
      // Validate password
      if (matchedRecord.passwordHash && matchedRecord.passwordHash !== cleanPass) {
        return {
          success: false,
          message: `Incorrect password for ${cleanEmail}. (Demo hint: default password is "password123" or "topper123")`
        };
      }
      setUser(matchedRecord.user);
      return {
        success: true,
        user: matchedRecord.user,
        message: `Welcome back, ${matchedRecord.user.name}!`
      };
    }

    // If student email not found yet, create their account smoothly with the provided password
    const studentName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: User = {
      id: 'student-' + Date.now(),
      name: studentName,
      email: cleanEmail,
      college: 'State Technical University',
      branch: 'CSE',
      semester: 3,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 100,
      savedNoteIds: [],
      downloadedNoteIds: [],
      upvotedNoteIds: [],
      uploadedNoteIds: []
    };

    const newRecord: StudentCredentialRecord = {
      passwordHash: cleanPass,
      user: newUser
    };

    accounts.push(newRecord);
    saveStoredAccounts(accounts);
    setUser(newUser);

    return {
      success: true,
      user: newUser,
      message: `Account created and logged in successfully as ${newUser.name}!`
    };
  };

  const registerWithEmail = async (data: {
    name: string;
    email: string;
    password?: string;
    college: string;
    branch: string;
    semester: number;
    rollNumber?: string;
  }): Promise<AuthResponse> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password?.trim() || 'password123';

    if (!data.name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid college or personal email address.' };
    }
    if (cleanPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const accounts = getStoredAccounts();
    const existingIdx = accounts.findIndex((a) => a.user.email.toLowerCase() === cleanEmail);

    const newUser: User = {
      id: 'student-' + Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      college: data.college.trim() || 'Engineering Institute',
      branch: data.branch || 'CSE',
      semester: data.semester || 1,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      reputationPoints: 120, // bonus welcome points
      savedNoteIds: ['note-1'],
      downloadedNoteIds: [],
      upvotedNoteIds: [],
      uploadedNoteIds: []
    };

    if (existingIdx !== -1) {
      // Update existing record
      accounts[existingIdx] = {
        passwordHash: cleanPass,
        user: newUser
      };
    } else {
      accounts.push({
        passwordHash: cleanPass,
        user: newUser
      });
    }

    saveStoredAccounts(accounts);
    setUser(newUser);

    return {
      success: true,
      user: newUser,
      message: `Welcome to EngiNotes, ${newUser.name}! +120 Karma Points awarded.`
    };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Email is required to reset password.' };
    }
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const accounts = getStoredAccounts();
    const idx = accounts.findIndex((a) => a.user.email.toLowerCase() === cleanEmail);

    if (idx === -1) {
      return { success: false, message: 'No registered student account found with this email.' };
    }

    accounts[idx].passwordHash = newPassword.trim();
    saveStoredAccounts(accounts);

    return {
      success: true,
      message: `Password updated successfully for ${cleanEmail}! You can now sign in.`
    };
  };

  const loginDemoStudent = (accountType: 'nitk' | 'iitb' | 'dtu' | 'vtu' = 'nitk') => {
    const map = {
      nitk: PRE_SEEDED_STUDENTS[0],
      iitb: PRE_SEEDED_STUDENTS[1],
      dtu: PRE_SEEDED_STUDENTS[2],
      vtu: PRE_SEEDED_STUDENTS[3]
    };
    const target = map[accountType] || PRE_SEEDED_STUDENTS[0];
    setUser(target.user);
  };

  const loginDemoTopper = () => {
    setUser(PRE_SEEDED_STUDENTS[1].user);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const isBookmarkSaved = (noteId: string) => {
    return user?.savedNoteIds.includes(noteId) || false;
  };

  const toggleUserBookmark = (noteId: string) => {
    if (!user) return;
    const isSaved = user.savedNoteIds.includes(noteId);
    const newSaved = isSaved
      ? user.savedNoteIds.filter((id) => id !== noteId)
      : [...user.savedNoteIds, noteId];

    setUser({
      ...user,
      savedNoteIds: newSaved
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        loginDemoStudent,
        loginDemoTopper,
        logout,
        updateProfile,
        isBookmarkSaved,
        toggleUserBookmark,
        rememberedEmail,
        setRememberedEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
