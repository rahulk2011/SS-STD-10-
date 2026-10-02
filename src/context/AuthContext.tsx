import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { UserProfile, UserRole, SchoolTenant } from '../types';
import { DEMO_USERS, INITIAL_SCHOOLS } from '../data/schoolsData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  currentSchool: SchoolTenant;
  currentRole: UserRole;
  schools: SchoolTenant[];
  loading: boolean;
  isFirebaseConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchSchool: (schoolId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schools] = useState<SchoolTenant[]>(INITIAL_SCHOOLS);
  const [currentSchool, setCurrentSchool] = useState<SchoolTenant>(INITIAL_SCHOOLS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEMO_USERS[0]);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  useEffect(() => {
    // Test initial connection as required by Firebase skill
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            setCurrentRole(data.role);
            const foundSchool = schools.find((s) => s.id === data.schoolId);
            if (foundSchool) setCurrentSchool(foundSchool);
          } else {
            // Create user doc
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'mgstudy45@gmail.com',
              displayName: user.displayName || 'Authorized User',
              role: 'student',
              schoolId: currentSchool.id,
              photoURL: user.photoURL || undefined
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Profile sync fallback:', err);
        }
      } else {
        // Fallback to active demo role for instant evaluation
        const defaultDemo = DEMO_USERS.find((u) => u.role === currentRole) || DEMO_USERS[0];
        setUserProfile(defaultDemo);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentRole, currentSchool.id, schools]);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const userDocRef = doc(db, 'users', user.uid);
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Study Scholar',
        role: currentRole,
        schoolId: currentSchool.id,
        photoURL: user.photoURL || undefined
      };
      await setDoc(userDocRef, profile, { merge: true });
      setUserProfile(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(DEMO_USERS[0]);
      setCurrentRole('student');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const demo = DEMO_USERS.find((u) => u.role === newRole);
    if (demo) {
      setUserProfile((prev) => (prev ? { ...prev, role: newRole, displayName: demo.displayName } : demo));
    }
  };

  const switchSchool = (schoolId: string) => {
    const sc = schools.find((s) => s.id === schoolId);
    if (sc) {
      setCurrentSchool(sc);
      setUserProfile((prev) => (prev ? { ...prev, schoolId: sc.id } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        currentSchool,
        currentRole,
        schools,
        loading,
        isFirebaseConnected,
        signInWithGoogle,
        logout,
        switchRole,
        switchSchool
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
