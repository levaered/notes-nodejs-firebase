// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyGnLhhLLeHN_eWqjIkXyYf-8Ig6dHLgQ",
  authDomain: "notes-766d1.firebaseapp.com",
  projectId: "notes-766d1",
  storageBucket: "notes-766d1.appspot.com",
  messagingSenderId: "457812775339",
  appId: "1:457812775339:web:16d4e26b46d13baa5942ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore database
export { db };
