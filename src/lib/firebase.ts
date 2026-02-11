import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyBpatog9K4wgBpXy5XE-YHcmTwALjlOBUA",
    authDomain: "kvarteret-events.firebaseapp.com",
    projectId: "kvarteret-events",
    storageBucket: "kvarteret-events.firebasestorage.app",
    messagingSenderId: "915628626345",
    appId: "1:915628626345:web:93fb93170dd30e67ce74b8",
    measurementId: "G-WF7KTB43GJ",
}

/*const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}*/

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, analytics, db, storage }
