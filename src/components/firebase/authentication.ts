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
  signInWithPopup,
  linkWithPopup,
  linkWithRedirect,
  getRedirectResult,
  unlink,
} from "firebase/auth";
import { OAuthProvider } from "firebase/auth";
import router from "@/router/index";
import Swal from "sweetalert2";
import { initializeFCM } from "./messaging";

const provider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider("microsoft.com");
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
      Swal.fire("Oops...", "Credenciales de usuario no válidas", "error");
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
  if (import.meta.env.MODE === "development") signInWithPopup(auth, microsoftProvider);
  else signInWithRedirect(auth, microsoftProvider);
}

export function linkWithMicrosoft() {
  const user = auth.currentUser;
  if (!user) {
    Swal.fire("Oops...", "Error interno de autenticación", "error");
    return;
  }

  if (import.meta.env.MODE === "development") {
    // En local usamos popup para feedback inmediato
    linkWithPopup(user, microsoftProvider)
      .then(async (result) => {
        // Una vez linkeado, opcionalmente quitamos password
        await unlink(result.user, "password");
        Swal.fire("¡Listo!", "Cuenta vinculada con Microsoft", "success");
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message, "error");
      });
  } else {
    // En producción redirigimos a Microsoft; el resultado lo procesa getRedirectResult()
    linkWithRedirect(user, microsoftProvider);
    // no hay .then() aquí con credenciales
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      // Verificar si es un login inicial con Microsoft o un linkeo
      const isMicrosoftLogin = result.user.providerData.some(
        (pd) => pd.providerId === "microsoft.com"
      );

      if (isMicrosoftLogin) {
        // Login exitoso con Microsoft
        Swal.fire(
          "Inicio de sesión correcto",
          "Bienvenid@ al portal de 365Obrador " + result.user.displayName,
          "success"
        );
        localStorage.setItem("loggedIn", "true");
        
        // Llamamos a initializeFCM después del inicio de sesión exitoso
        initializeFCM();
      }

      // ¡Linkeo completado!
      const hasPasswordProvider = result.user.providerData.some(
        (pd) => pd.providerId === "password",
      );

      if (hasPasswordProvider) await unlink(result.user, "password");
    }
  } catch (error) {
    // Maneja errores típicos de linkeo (p.ej. cuenta-exists-with-different-credential)
    console.error("Error en redirect result:", error);
    Swal.fire("Error al vincular", error.message, "error");
  }
}
