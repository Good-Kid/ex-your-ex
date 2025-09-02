// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyARD6QXTiiulw9QFMKlHWdVnwVj66J7BOs",
    authDomain: "ex-your-ex.firebaseapp.com",
    projectId: "ex-your-ex",
    storageBucket: "ex-your-ex.firebasestorage.app",
    messagingSenderId: "775180189478",
    appId: "1:775180189478:web:33a867db330e92d6ea0be7",
    measurementId: "G-FZJM8ZJEZD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
