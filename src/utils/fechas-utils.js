import moment from "moment-timezone";

export function generarHoraDeString(horaString) {
    const raw = horaString.split(':')

    const horas = Number(raw[0])
    const minutos = Number(raw[1])

    const nuevaHora = new Date()
    nuevaHora.setMonth(0)
    nuevaHora.setDate(1)

    nuevaHora.setHours(horas)
    nuevaHora.setMinutes(minutos)
    nuevaHora.setSeconds(0)
    nuevaHora.setMilliseconds(0)

    return nuevaHora
}

export function obtenerFechaLimpia(fecha) {
    const dia = fecha.getDate()
    const mes = fecha.getMonth()
    const anio = fecha.getFullYear()
    
    const fechaLimpia = new Date()
    fechaLimpia.setDate(dia)
    fechaLimpia.setMonth(mes)
    fechaLimpia.setFullYear(anio)
    
    fechaLimpia.setHours(0)
  	fechaLimpia.setMinutes(0)
	fechaLimpia.setSeconds(0)
  	fechaLimpia.setMilliseconds(0)
    
    return fechaLimpia
}


export function obtenerFechaFormateada() {
  // Obtener la fecha actual
  const horaRegistro = new Date();

  // Definir la zona horaria de México (GMT-6)
  const zonaHorariaMexico = 'America/Mexico_City';

  // Obtener la fecha con la zona horaria de México
  const fechaMexico = moment.tz(horaRegistro, zonaHorariaMexico);

  // Formatear la fecha en el formato deseado
  const formatoFecha = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
  const fechaFormateada = fechaMexico.format(formatoFecha);

  return fechaFormateada;
}