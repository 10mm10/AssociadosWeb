

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyD9VOdVRYB905MJlAl63pWwaTC2eZASzTc",
  authDomain: "associadosweb-app.firebaseapp.com",
  projectId: "associadosweb-app",
  storageBucket: "associadosweb-app.firebasestorage.app",
  messagingSenderId: "817529156131",
  appId: "1:817529156131:web:a0ccc35d76ecfb2c1db796"
};

// Inicializa o app
export const app = initializeApp(firebaseConfig);