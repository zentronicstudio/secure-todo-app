// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAe3dmNWkZ6ybIbtsBczeg4nxyPtCjNt6M",
  authDomain: "todo-app-3415a.firebaseapp.com",
  projectId: "todo-app-3415a",
  storageBucket: "todo-app-3415a.firebasestorage.app",
  messagingSenderId: "623211849514",
  appId: "1:623211849514:web:ec15de9d467b170ef1e053"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Setup reCAPTCHA (can be used in VerifyPage)
const initRecaptcha = (elementId) => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: (response) => {
      console.log("reCAPTCHA solved:", response);
    },
    'expired-callback': () => {
      console.warn("reCAPTCHA expired");
    }
  });
  return window.recaptchaVerifier;
};

// Export needed Firebase tools
export {
  auth,
  db,
  PhoneAuthProvider,
  signInWithCredential,
  initRecaptcha,
};
