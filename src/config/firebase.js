import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace this with your actual Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCMyPaPj9M59pQr0z5YrK_UhKuRa94bfXg",
  authDomain: "kid-from-manila.firebaseapp.com",
  projectId: "kid-from-manila",
  storageBucket: "kid-from-manila.firebasestorage.app",
  messagingSenderId: "377322180886",
  appId: "1:377322180886:web:cc17d177b0e44cb65d0037"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db }; 