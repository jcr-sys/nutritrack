// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPR7r8yjAZnlDVfv6tHkIKXv7m07NKEOA",
  authDomain: "btyeme-929ff.firebaseapp.com",
  projectId: "btyeme-929ff",
  storageBucket: "btyeme-929ff.firebasestorage.app",
  messagingSenderId: "99600800864",
  appId: "1:99600800864:web:2d95baaaf45aac7ebf7705",
  measurementId: "G-K63CLVT0K4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore (database)
const db = firebase.firestore();

// Initialize Auth (for login)
const auth = firebase.auth();

// Optional: Initialize Analytics
const analytics = firebase.analytics();