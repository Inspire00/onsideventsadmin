import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';



const firebaseConfig = {
    apiKey: "AIzaSyCSLZwINQMjIN6HRCurSZebnLGZp-UBJX4",
    authDomain: "sibuta-events.firebaseapp.com",
    databaseURL: "https://sibuta-events-default-rtdb.firebaseio.com",
    projectId: "sibuta-events",
    storageBucket: "gs://phanda-ad118.firebasestorage.app",
    messagingSenderId: "928170439465",
    appId: "1:928170439465:web:676f49a3db402b4644bd38",
    measurementId: "G-BW41CG42LF"
  };


  export default firebaseConfig;
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const storage = getStorage(app);
  export const auth = getAuth(app);
