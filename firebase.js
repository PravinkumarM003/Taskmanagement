// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArBXhMLK3_mR7JZGRAojvcmdiA5Dr7R9Y",
  authDomain: "bitcis.firebaseapp.com",
  projectId: "bitcis",
  storageBucket: "bitcis.firebasestorage.app",
  messagingSenderId: "822782665633",
  appId: "1:822782665633:web:0f8ce894784f06124a21e0",
  measurementId: "G-BSPRPZ6RV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);