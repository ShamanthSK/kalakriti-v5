import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxN1kahYiW5Pg5xCrRxWAFKRgKaKNBt3Y",
  authDomain: "kalakriti-84f9d.firebaseapp.com",
  projectId: "kalakriti-84f9d",
  storageBucket: "kalakriti-84f9d.firebasestorage.app",
  messagingSenderId: "900894287700",
  appId: "1:900894287700:web:8841d04374050e47cc8ac1",
  measurementId: "G-EKXX8GW29X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;