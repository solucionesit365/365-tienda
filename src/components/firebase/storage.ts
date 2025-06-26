import { app } from "./index";
import {
  getStorage,
  ref,
  uploadBytes,
  getBlob,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage(app, import.meta.env.VITE_BUCKET_URL);

export function descargarArchivo(filePath: string) {
  const referencia = ref(storage, filePath);
  getBlob(referencia)
    .then((archivoBlob) => {
      const objectUrl = window.URL.createObjectURL(archivoBlob);
      window.open(objectUrl);
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function subirArchivoConNombre(file: File, rutaCompleta: string) {
  if (file && rutaCompleta) {
    const storageRef = ref(storage, rutaCompleta);
    try {
      await uploadBytes(storageRef, file);
      return storageRef.fullPath;
    } catch (error) {
      console.log(error);
      return null;
    }
  } else {
    console.log("Debes subir un archivo y especificar la ruta completa.");
    return null;
  }
}

// Obtener URL archivo para visualizar en tag Image
export async function obtenerUrlImagen(filePath: string) {
  const referencia = ref(storage, filePath);
  const url = await getDownloadURL(referencia);
  return url;
}

export async function subirArchivoGeneral(file: File, carpeta: string) {
  if (file) {
    const extension = file.type.split("/")[1];
    const storageRef = ref(storage, `${carpeta}/${Date.now()}.${extension}`);
    try {
      await uploadBytes(storageRef, file);
      return storageRef.fullPath;
    } catch (error) {
      console.log(error);
      return null;
    }
  } else {
    console.log("debes subir al menos un archivo");
    return null;
  }
}

export function borrarArchivo(filePath: string) {
  const desertRef = ref(storage, filePath);
  deleteObject(desertRef)
    .then(() => {
      console.log("Archivo eliminado");
    })
    .catch((error) => {
      console.log("Error borrar archivo", error);
    });
}
