
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBWUjKRUpiLmwRi7UjQ5l_zCJ1YOGsaIg0",
  authDomain: "fresh-hub-d509f.firebaseapp.com",
  databaseURL: "https://fresh-hub-d509f-default-rtdb.firebaseio.com",
  projectId: "fresh-hub-d509f",
  storageBucket: "fresh-hub-d509f.firebasestorage.app",
  messagingSenderId: "101887757266",
  appId: "1:101887757266:web:80c054959f6588771fd60b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
