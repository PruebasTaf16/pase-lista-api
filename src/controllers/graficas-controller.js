import { Router } from "express";
import { AsistenciasModel, EstadosAsistenciaModel, EstadosJustificanteModel, JustificantesModel, MotivosInasistenciaModel, RolesModel, UsuarioModel } from "../models/index.js";
import {obtenerFechaLimpia} from "../utils/fechas-utils.js";

const rutas = Router({mergeParams: true})

/**Trae la información para construir la gráfica de la asistencia de hoy */
rutas.get('/asistencia-hoy', async (req, res) => {
    try {
        const usuariosDB = await UsuarioModel.find();
        const fechaGte = new Date();
        fechaGte.setHours(fechaGte.getHours()-6);
        const fechaLt = new Date();
        fechaLt.setHours(fechaLt.getHours()-6)
        const asistenciasDB = await AsistenciasModel.find({
            horaAsistencia: {
                $gte: fechaGte.setHours(0, 0, 0, 0),
                $lt: fechaLt.setHours(23, 59, 59, 999),
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
});

rutas.post('/asistencia-dia', async (req, res) => {
    const datos = req.body;
    try {
        const usuariosDB = await UsuarioModel.find();
        const asistenciasDB = await AsistenciasModel.find({
            idDia: datos.dia,
            // horaAsistencia: {
            //     $gte: new Date(new Date(datos.fecha).setHours(0, 0, 0, 0)),
            //     $lt: new Date(new Date(datos.fecha).setHours(23, 59, 59, 999)),
            // }
        }).populate('idEstadoAsistencia')

        let asistencia = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Asistencia normal').length;
        let faltaJustificada = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Inasistencia justificada').length;
        let esperandoJustificacion = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Esperando Justificación').length;
        let inasistencia = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Inasistencia').length;
        let retraso = asistenciasDB.filter(asist => asist.idEstadoAsistencia.nombre == 'Asistencia con retraso').length;

        let sinAccion = usuariosDB.length - (asistencia + faltaJustificada + esperandoJustificacion + inasistencia + retraso);

        inasistencia += sinAccion;
        console.log({
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
        })
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
});

rutas.get('/roles-ocupacion', async (req, res) => {
    try {
        const usuariosDB = await UsuarioModel.find({});
        const rolesDB = await RolesModel.find({});

        const data = {};
        for (const rol of rolesDB) {
            data[rol.nombre] = 0;
            for (const usuario of usuariosDB) {
                if (usuario.idRol.equals(rol._id)) {
                    data[rol.nombre]++;
                }
            }
        }

        res.status(200).json({
            msg: "Numero de ocupaciones por rol",
            data
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({msg: "Error"});
    }
});

rutas.get('/estado-asistencia-general', async (req, res) => {
    try {
        const tiposAsistenciaDB = await EstadosAsistenciaModel.find({});
        const asistenciasDB = await AsistenciasModel.find({});

        const data = {};
        for (const tipo of tiposAsistenciaDB) {
            data[tipo.nombre] = 0;
            for (const asistencia of asistenciasDB) {
                if (asistencia.idEstadoAsistencia.equals(tipo._id)) {
                    data[tipo.nombre]++;
                }
            }
        }

        res.status(200).json({
            msg: "Estado de las asistencias en general",
            data
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: "Error"});
    }
});

rutas.get('/motivos-faltas', async (req, res) => {
    try {
        const motivosInasistenciaDB = await MotivosInasistenciaModel.find({});
        const justificantesDB = await JustificantesModel.find({});

        const data = {}
        for (const motivo of motivosInasistenciaDB) {
            data[motivo.nombre] = 0;
            for (const justificante of justificantesDB) {
                if (justificante.idMotivoInasistencia.equals(motivo._id)) {
                    data[motivo.nombre]++;
                }
            }
        }

        res.status(200).json({
            msg: "Motivos de las faltas con justificante",
            data
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: "Error"});
    }
});

rutas.get('/estatus-justificantes', async (req, res) => {
    try {
        const estadosJustificantesDB = await EstadosJustificanteModel.find({});
        const justificantesDB = await JustificantesModel.find({});

        const data = {};
        for (const estado of estadosJustificantesDB) {
            data[estado.nombre] = 0;
            for (const justificante of justificantesDB) {
                if (justificante.idEstadoJustificante.equals(estado._id)) {
                    data[estado.nombre]++;
                }
            }
        }
        res.status(200).json({
            msg: "Estados de los justificantes",
            data
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: "Error"});
    }
})

export const graficasRouter = Router().use('/graficas', rutas);