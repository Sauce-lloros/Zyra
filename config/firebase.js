import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSkyZYinQYq2WpGPW60V930hoaC6DEDUw",
  authDomain: "zyra-c57a5.firebaseapp.com",
  projectId: "zyra-c57a5",
  storageBucket: "zyra-c57a5.firebasestorage.app",
  messagingSenderId: "129205760115",
  appId: "1:129205760115:web:28244c8b4684cf576f3a06"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);