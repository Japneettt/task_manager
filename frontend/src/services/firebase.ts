import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAFOiz_K_mByNS8tEMsdptI7YVFDm-eks",
    authDomain: "trelloclone-5bcc6.firebaseapp.com",
    projectId: "trelloclone-5bcc6",
    storageBucket: "trelloclone-5bcc6.firebasestorage.app",
    messagingSenderId: "48145212423",
    appId: "1:48145212423:web:0b78f076cb098108f836a2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth + provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();