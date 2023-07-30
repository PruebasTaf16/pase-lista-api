import { Router } from "express";
import { AsistenciasModel, UsuarioModel } from "../models/index.js";
import {obtenerFechaLimpia} from "../utils/fechas-utils.js";

const rutas = Router({mergeParams: true})

/**Trae la información para construir la gráfica de la asistencia de hoy */
rutas.get('/asistencia-hoy', async (req, res) => {
    try {
        const usuariosDB = await UsuarioModel.find();
        const asistenciasDB = await AsistenciasModel.find({
            horaAsistencia: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            }
        }).populate('idEstadoAsistencia')

        console.log(asistenciasDB);

        let asistencia = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Asistencia normal').length;
        let faltaJustificada = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Inasistencia justificada').length;
        let esperandoJustificacion = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Esperando Justificación').length;
        let inasistencia = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Inasistencia').length;
        let retraso = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Asistencia con retraso').length;

        let sinAccion = usuariosDB.length - (asistencia + faltaJustificada + esperandoJustificacion + inasistencia + retraso);

        inasistencia += sinAccion;

        res.status(200).json({
            msg: 'Listado', 
            data: {
                asistencia: {
                    label: 'Asistencia',
                    cantidad: asistencia
                }, 
                faltaJustificada: {
                    label: 'Falta justificada',
                    cantidad: faltaJustificada
                }, 
                esperandoJustificacion: {
                    label: 'Esperando justificación',
                    cantidad: esperandoJustificacion
                }, 
                inasistencia: {
                    label: 'Inasistencia',
                    cantidad: inasistencia,
                },
                retraso: {
                    label: 'Asistencia con retraso',
                    cantidad: retraso,
                },
                todos: {
                    label: 'Todos',
                    cantidad: usuariosDB.length,
                },
            }
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({msg: 'Error'});
    }
})

export const graficasRouter = Router().use('/graficas', rutas);