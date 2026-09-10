
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLou63W9afIA6klVTwUomly98xJ7GY7nw",
  authDomain: "my-2d-canvas-editor.firebaseapp.com",
  projectId: "my-2d-canvas-editor",
  storageBucket: "my-2d-canvas-editor.firebasestorage.app",
  messagingSenderId: "118778928889",
  appId: "1:118778928889:web:0dc6684c832017f8468c28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);