// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4JEAzoCpc4bgjVG_zMCRVvQIsBAwIxNs",
  authDomain: "rbac-f8cb2.firebaseapp.com",
  projectId: "rbac-f8cb2",
  storageBucket: "rbac-f8cb2.firebasestorage.app",
  messagingSenderId: "431076806300",
  appId: "1:431076806300:web:37dd45f531c7446216a759",
  measurementId: "G-WBPTMY52W3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);