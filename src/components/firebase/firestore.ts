import { app } from "./index";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  getDocs,
  type WhereFilterOp,
} from "firebase/firestore";
import Swal from "sweetalert2";

export const db = getFirestore(app);

export async function insertDocument(payload: unknown, nombreColeccion: string) {
  try {
    await addDoc(collection(db, nombreColeccion), payload); // const docRef =
    return true;
  } catch (err) {
    console.log("Error adding document: ", err);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateDocument(payload: any, nombreColeccion: string, idDocument: string) {
  try {
    const docRef = doc(db, nombreColeccion, idDocument);
    await updateDoc(docRef, payload);
    return true;
  } catch (err) {
    console.log("Error updating document: ", err);
    return false;
  }
}

export async function deleteDocument(nombreColeccion: string, idDocument: string) {
  try {
    const docRef = doc(db, nombreColeccion, idDocument);
    await deleteDoc(docRef);
    return 202;
  } catch (err) {
    console.log("Error eliminando el documento: ", err);
  }
}

export async function getAllDocs(coleccion: string) {
  try {
    const data: { id: string }[] = [];
    const querySnapshot = await getDocs(collection(db, coleccion));
    querySnapshot.forEach((doc) =>
      data.push({
        id: doc.id,
        ...doc.data(),
      }),
    );
    return data;
    // return querySnapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getNombreCompletoByUid(uid: string) {
  try {
    const coleccion = collection(db, "usuarios");
    const queryConstraint = where("uid", "==", uid);
    const q = query(coleccion, queryConstraint);
    const querySnapshot = await getDocs(q);
    let infoUser = null;
    infoUser = querySnapshot.docs[0].data();
    return `${infoUser.nombre} ${infoUser.apellidos}`;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getDocumentsQuery(
  nombreColeccion: string,
  campoABuscar: string,
  operador: WhereFilterOp,
  valor: unknown,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = [];
    const coleccion = collection(db, nombreColeccion);
    const donde = where(campoABuscar, operador, valor);
    const q = query(coleccion, donde);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) =>
      data.push({
        idDocumento: doc.id,
        ...doc.data(),
      }),
    );
    return data;
  } catch (err) {
    console.log(err, nombreColeccion);
    return null;
  }
}

export async function getDocumentsMultiQuery(
  nombreColeccion: string,
  campoABuscar1: string,
  operador1: WhereFilterOp,
  valor1: unknown,
  campoABuscar2: string,
  operador2: WhereFilterOp,
  valor12: unknown,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = [];
    const coleccion = collection(db, nombreColeccion);
    const query1 = where(campoABuscar1, operador1, valor1);
    const query2 = where(campoABuscar2, operador2, valor12);

    const q = query(coleccion, query1, query2);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) =>
      data.push({
        id: doc.id,
        ...doc.data(),
      }),
    );
    return data;
  } catch (err) {
    console.log(err);
    Swal.fire("Oops...", "Error al obtener documentos", "error");
    return null;
  }
}
