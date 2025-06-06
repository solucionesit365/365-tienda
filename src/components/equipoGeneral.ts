import { axiosInstance } from "@/components/axios/axios";
import { DateTime } from "luxon";

export async function getEquipoDe(idApp: string) {
  const resEquipo = await axiosInstance.get("trabajadores/getSubordinados", {
    params: { uid: idApp },
  });
  if (resEquipo.data.ok && resEquipo.data?.data?.length > 0) return resEquipo.data.data;
  else return null;
}

function numberDaysInYear() {
  const ahora = DateTime.now();
  if (ahora.isInLeapYear) return 366;
  return 365;
}

function calculoVacaciones(antiguedad: DateTime, inicioContrato: DateTime, accion: string) {
  const daysYear = numberDaysInYear();
  const acumuladoDiario = 30 / daysYear;
  let currentYear2: number = DateTime.now().year;
  let finalYear: DateTime;

  if (!antiguedad.isValid) throw Error("La fecha de antiguedad es incorrecta");

  switch (accion) {
    case "calculoAñoActual":
      finalYear = DateTime.fromObject({ year: currentYear2 }).endOf("year");
      break;
    case "calculoAñoAnterior":
      currentYear2 = currentYear2 - 1;
      finalYear = DateTime.fromObject({ year: currentYear2 }).endOf("year");
      break;
    default:
      finalYear = DateTime.fromObject({ year: currentYear2 }).endOf("year"); // Copiando al calculoAñoActual
      break;
  }
  // Verificar si el contrato comienza en un año futuro
  if (inicioContrato > DateTime.fromObject({ year: currentYear2 }).endOf("year")) {
    return 0; // Manejar el caso de que el contrato comience en un año futuro
  }
  if (currentYear2 > antiguedad.year) {
    return 30;
  } else if (currentYear2 === antiguedad.year) {
    // const firstDayYear = DateTime.fromObject({ year: ahora.year });
    if (!inicioContrato.isValid) throw Error("La fecha de inicio de contrato es incorrecta");

    const diasTranscurridos = Math.abs(finalYear.diff(inicioContrato, "days").days) + 1;
    return Math.round(diasTranscurridos * acumuladoDiario);
  } else throw Error("¿Contrato del futuro?");
}

export function calcularSaldoEmpleado(
  trabajador: {
    id: number;
    idApp: string;
    nombreApellidos: string;
    idTienda: number;
    antiguedad: string;
    contratos: any[];
    excedencia: boolean;
  },
  arraySoliMiEquipo: any[],
  accion: string = "",
) {
  if (trabajador.excedencia) {
    const antiguedad = DateTime.fromISO(trabajador.contratos[0].inicioContrato);
    const inicioContrato = DateTime.fromISO(trabajador.contratos[0].inicioContrato);
    const diasDisponibles = calculoVacaciones(antiguedad, inicioContrato, accion);
    return getVacaciones(trabajador.id, arraySoliMiEquipo, diasDisponibles);
  } else {
    const antiguedad = DateTime.fromISO(trabajador.contratos[0].fechaAntiguedad);
    const inicioContrato = DateTime.fromISO(trabajador.contratos[0].fechaAntiguedad);
    const diasDisponibles = calculoVacaciones(antiguedad, inicioContrato, accion);
    return getVacaciones(trabajador.id, arraySoliMiEquipo, diasDisponibles);
  }
}

function calcularDiasPendientes(stringInicio: string, stringFinal: string) {
  // const ahora = DateTime.now().startOf("day");
  const fechaInicio = DateTime.fromFormat(stringInicio, "dd/MM/yyyy");
  const fechaFinal = DateTime.fromFormat(stringFinal, "dd/MM/yyyy");

  if (fechaInicio.isValid && fechaFinal.isValid) {
    const diasSolicitados = Math.abs(fechaInicio.diff(fechaFinal, "days").days) + 1;

    // if (ahora <= fechaInicio) {
    return { diasSolicitados, pendientes: diasSolicitados };
    // } else if (ahora > fechaInicio && ahora <= fechaFinal) {
    //   return {
    //     diasSolicitados,
    //     pendientes: Math.abs(fechaFinal.diff(ahora, "days").days) + 1,
    //   };
    // } else {
    //   return { diasSolicitados, pendientes: 0 };
    // }
  }
  throw Error("Fechas de inicio o final de vacaciones incorrecta/s");
}

function calcularDiasDisfrutados(meQuedan: number, diasSolicitados: number) {
  return diasSolicitados - meQuedan;
}

function getVacaciones(
  idUsuarioSql: number,
  arraySoliMiEquipo: {
    idBeneficiario: number;
    dias: number;
    fechaInicio: string;
    fechaFinal: string;
    fechaIncorporacion: string;
    observaciones: string;
    respuestaSolicitud: string;
    fechaCreacion: string;
    estado: string;
    idSolicitud: number;
  }[],
  diasTotales: number,
) {
  try {
    let totalMeQuedan = 0;
    let totalPendienteValidar = 0;
    let totalDiasSolicitados = 0;
    let diasDisponibles = 0;
    let diasDisfrutados = 0;
    let aprobados = 0;

    if (arraySoliMiEquipo) {
      for (let i = 0; i < arraySoliMiEquipo.length; i++) {
        if (arraySoliMiEquipo[i].idBeneficiario === idUsuarioSql) {
          if (arraySoliMiEquipo[i].estado === "APROBADA") {
            const res = calcularDiasPendientes(
              arraySoliMiEquipo[i].fechaInicio,
              arraySoliMiEquipo[i].fechaFinal,
            );
            totalMeQuedan += res.pendientes;
            totalDiasSolicitados += res.diasSolicitados;
            aprobados += res.diasSolicitados;
          } else if (arraySoliMiEquipo[i].estado === "PENDIENTE") {
            const res = calcularDiasPendientes(
              arraySoliMiEquipo[i].fechaInicio,
              arraySoliMiEquipo[i].fechaFinal,
            );
            totalPendienteValidar += res.pendientes;
          }
        }
      }

      diasDisfrutados = calcularDiasDisfrutados(totalMeQuedan, totalDiasSolicitados);

      diasDisponibles = diasTotales - aprobados - totalPendienteValidar; // (totalDiasSolicitados - totalMeQuedan);
    }

    return {
      aprobados,
      diasDisponibles,
      totalDiasYear: diasTotales,
      diasDisfrutados,
      totalPendienteValidar,
    };
  } catch (err) {
    console.log(err);
    return {
      aprobados: -100,
      diasDisfrutados: -100,
      totalPendienteValidar: -100,
      diasDisponibles: -100,
      totalDiasYear: -100,
    };
  }
}

export function getTipoUsuario(user: { idTienda: number; llevaEquipo: boolean }) {
  if (user.idTienda && user.llevaEquipo) return "COORDINADORA";
  if (user.idTienda && !user.llevaEquipo) return "DEPENDIENTA";
  if (!user.idTienda && user.llevaEquipo) return "SUPERVISORA";
  return "PERMISO_DESCONOCIDO";
}
