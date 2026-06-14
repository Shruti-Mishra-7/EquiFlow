// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPXuHCvPfOtabm-VVerzj_Q_5YNNb7oCE",
  authDomain: "equiflow-4c82c.firebaseapp.com",
  projectId: "equiflow-4c82c",
  storageBucket: "equiflow-4c82c.firebasestorage.app",
  messagingSenderId: "495772136038",
  appId: "1:495772136038:web:db8c7af6cb6ca20c9df3a7",
  measurementId: "G-BEYHBQVTZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);