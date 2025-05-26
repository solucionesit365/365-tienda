import { app } from "./index";
import {
  GoogleAuthProvider,
  signOut,
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCustomToken as signInWithCustomTokenCompat,
  type User,
} from "firebase/auth";
import { OAuthProvider } from "firebase/auth";
import router from "@/router/index";
import Swal from "sweetalert2";
import { initializeFCM } from "./messaging";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export function checkLogin() {
  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}

export async function getCurrentUserToken() {
  if (auth.currentUser) return await auth.currentUser.getIdToken(true);
  throw new Error("auth.currentUser no existe");
}

export function logout() {
  localStorage.setItem("shopMode", "false");
  console.log("Cerrando sesión");
  signOut(auth);
  router.push("/login");
}

export function loginGoogleWithRedirect() {
  signInWithRedirect(auth, provider);
}

export async function signInWithCustomToken(customToken: string) {
  try {
    const userCredential = await signInWithCustomTokenCompat(auth, customToken);

    if (userCredential) router.push("/");
  } catch (error) {
    console.error("Error signing in with custom token:", error);
  }
}

/* Entrar con tipo email + contraseña */
export function accederConEmail(email: string, password: string) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      Swal.fire(
        "Inicio de sesión correcto",
        "Bienvenid@ al portal de 365Obrador " + userCredential.user.displayName,
        "success",
      );
      localStorage.setItem("loggedIn", "true");
      router.push("/");

      // Llamamos a initializeFCM después del inicio de sesión exitoso
      initializeFCM();
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema", "error");
    });
}

/* Crear usuario de tipo email + contraseña */
export function createUser(email: string, password: string) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      Swal.fire("OK", `¡${userCredential.user.email} registrado correctamente!`, "success");
      router.push("/");
    })
    .catch((err) => {
      console.log(err);
      Swal.fire("Oops...", "Ha habido un problema", "error");
    });
}

export function restablecerContraseña(email: string) {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Perfecto...",
        html: `Hemos enviado un email al correo <span class="text-primary">${email}</span> para restablecer la constraseña`,
        showConfirmButton: true,
      }).then(function () {
        router.push("/login");
      });
    })
    .catch((error) => {
      if (error.message == "Firebase: Error (auth/invalid-email).") {
        Swal.fire({
          icon: "error",
          title: "Ups...",
          text: `Esto no es un correo`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
      if (error.message == "Firebase: Error (auth/user-not-found).") {
        Swal.fire({
          icon: "error",
          title: "Ups...",
          html: `El correo <span class="text-primary">${email}</span> no existe en nuestra base de datos`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    });
}

export function accederConMicrosoft() {
  const provider = new OAuthProvider("microsoft.com");
  signInWithRedirect(auth, provider);
}
