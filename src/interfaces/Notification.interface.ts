export type TNotification = {
  uid: string;
  titulo: string;
  mensaje: string;
  leido: false | true;
  creador: "SISTEMA" | "RRHH";
  url: string;
  _id: string;
};
