// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvvd_Y0tFjU-c0G9eA_7x1s0N9hOM49z8",
  authDomain: "collabboard-9e42f.firebaseapp.com",
  projectId: "collabboard-9e42f",
  storageBucket: "collabboard-9e42f.firebasestorage.app",
  messagingSenderId: "917607643058",
  appId: "1:917607643058:web:ea40a799642b731a7c16ab",
  measurementId: "G-KHBZT08R9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth=getAuth(app);


export { auth };