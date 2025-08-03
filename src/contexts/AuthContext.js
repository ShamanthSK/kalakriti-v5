import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name, photo = null, category = 'Visual Arts') {
    try {
      console.log('AuthContext: Starting signup process...');
      console.log('AuthContext: Email:', email);
      console.log('AuthContext: Name:', name);
      console.log('AuthContext: Category:', category);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('AuthContext: User created successfully:', user.uid);
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
        photoURL: photo
      });
      
      console.log('AuthContext: Profile updated successfully');

      // Create user document in Firestore
      const userData = {
        name,
        email,
        photo: photo || null,
        primaryCategory: category,
        talents: [],
        joinDate: new Date().toISOString(),
        isOnline: true
      };
      
      console.log('AuthContext: Creating user document in Firestore...');
      console.log('AuthContext: User data:', userData);
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      console.log('AuthContext: User document created successfully');

      return user;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      console.error('AuthContext: Error code:', error.code);
      console.error('AuthContext: Error message:', error.message);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  async function getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { id: uid, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await getUserData(user.uid);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserData,
    refreshUserData: async () => {
      if (auth.currentUser) {
        const userData = await getUserData(auth.currentUser.uid);
        setCurrentUser(userData);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 