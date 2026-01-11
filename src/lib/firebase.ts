// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// Using environment variables for better security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZRM1I0Az3NAzCON0PGCKDSnKptRFSqSQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vetqure-pms.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://vetqure-pms-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vetqure-pms",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vetqure-pms.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "896549033598",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:896549033598:web:281aa64b599184833b6a2f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E1YMQ5ETNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export the app instance
export default app;
