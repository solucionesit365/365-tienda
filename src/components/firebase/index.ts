import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCME2CYaIso7PngM2wihV4LZGB_JzZoKjc",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: "silema",
  storageBucket: "silema.appspot.com",
  messagingSenderId: "565898129046",
  appId: "1:565898129046:web:7245c59623deb1f72c1cb7",
  measurementId: "G-1J6JS28GMD",
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
