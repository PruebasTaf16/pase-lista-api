import { Router } from "express";
import { AsistenciasModel, JustificantesModel, MotivosInasistenciaModel } from "../models/index.js";
import { obtenerFechaLimpia } from "../utils/fechas-utils.js";

const rutas = Router({mergeParams: true});

/**Trae todo el listado de justificantes para aprobar o desaprobar el día de hoy */
rutas.get('/listado-justificantes-hoy', async (req, res) => {
    try {
        const asistenciasDB = await AsistenciasModel.find({horaAsistencia: obtenerFechaLimpia(new Date())})
            .populate('idUsuario')
            .populate('idEstadoAsistencia');

        let listado = [];
        for await (const asistenciaJustificante of asistenciasDB) {
            const justificante = await JustificantesModel.findOne({idAsistencia: asistenciaJustificante._id})
                .populate({
                    path: 'idAsistencia',
                    populate: {
                        path: 'idUsuario',
                        model: 'usuarios',
                        populate: {
                            path: 'idRol',
                            model: 'roles',
                        }
                    }
                })
                .populate('idMotivoInasistencia')
                .populate('idEstadoJustificante');
            if (justificante) listado.push(justificante)
        }

        res.status(200).json({msg: 'Listado', data: listado});
    } catch (e) {
        
    }
})
/**Trae una lista con todos los motivos de inasistencia */
rutas.get('/listado-motivos-inasistencia', async (req, res) => {
    try {
        const listadoDB = await MotivosInasistenciaModel.find({});

        res.status(200).json({data: listadoDB});
    } catch (e){
        console.log(e)
        res.status(500).json({msg: 'Error'});
    }
})


export const variosRouter = Router().use('/varios', rutas);