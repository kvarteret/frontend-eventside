import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBpatog9K4wgBpXy5XE-YHcmTwALjlOBUA",
  authDomain: "kvarteret-events.firebaseapp.com",
  projectId: "kvarteret-events",
  storageBucket: "kvarteret-events.firebasestorage.app",
  messagingSenderId: "915628626345",
  appId: "1:915628626345:web:93fb93170dd30e67ce74b8",
  measurementId: "G-WF7KTB43GJ",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
