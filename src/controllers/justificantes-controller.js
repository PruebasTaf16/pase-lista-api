import { Router } from "express";

import { AsistenciasModel, EstadosAsistenciaModel, EstadosJustificanteModel, JustificantesModel, MotivosInasistenciaModel, UsuarioModel } from "../models/index.js";

const rutas = Router({mergeParams: true})

/**Muestra la información del justificante por medio de su ID */
rutas.get('/ver/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const justificanteDB = await JustificantesModel.findById(id)
        .populate({
            path: 'idAsistencia',
            populate: {
                path: 'idUsuario',
                model: 'usuarios',
            }
        })
        .populate('idMotivoInasistencia')
        .populate('idEstadoJustificante')

        if (!justificanteDB) return res.status(404).json({msg: 'No encontrado'});  

        res.status(200).json({msg: 'Justificante', data: justificanteDB})
    } catch (e) {
        console.log(e)
        res.status(500).json({msg: 'Error'})
    } 
})
/**Acepta el justificante */
rutas.post('/aceptar/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const justificanteDB = await JustificantesModel.findById(id)
            .populate('idAsistencia')
            .populate('idMotivoInasistencia')
            .populate('idEstadoJustificante')

        if (!justificanteDB) return res.status(404).json({msg: 'No encontrado'});

        const asistenciaDB = await AsistenciasModel.findById(justificanteDB.idAsistencia);
        const estadoJustificante = await EstadosJustificanteModel.findOne({nombre: 'Aceptado'});
        const estadoAsistenciaDB = await EstadosAsistenciaModel.findOne({nombre: 'Inasistencia justificada'});

        justificanteDB.idEstadoJustificante = estadoJustificante._id;
        asistenciaDB.idEstadoAsistencia = estadoAsistenciaDB._id;

        await Promise.all([justificanteDB.save(), asistenciaDB.save()])

        return res.status(200).json({msg: 'Justificante Aceptado'});

        /**POR SI NO SE QUIERE ESTAR ACTUALIZANDO EL ESTADO */

        // if (justificanteDB.idEstadoJustificante.nombre == 'Enviado') {

        //     const asistenciaDB = await AsistenciasModel.findById(justificanteDB.idAsistencia);
        //     const estadoJustificante = await EstadosJustificanteModel.findOne({nombre: 'Aceptado'});
        //     const estadoAsistenciaDB = await EstadosAsistenciaModel.findOne({nombre: 'Inasistencia justificada'});

        //     justificanteDB.idEstadoJustificante = estadoJustificante._id;
        //     asistenciaDB.idEstadoAsistencia = estadoAsistenciaDB._id;

        //     await Promise.all([justificanteDB.save(), asistenciaDB.save()])

        //     return res.status(200).json({msg: 'Justificante Aceptado'});
        // } 
        // else {
        //     return res.status(401).json({msg: 'El justificante ya se ha tratado'});
        // }
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: 'Error'})
    }
})
/**Rechaza el justificante */
rutas.post('/rechazar/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const justificanteDB = await JustificantesModel.findById(id)
            .populate('idAsistencia')
            .populate('idMotivoInasistencia')
            .populate('idEstadoJustificante')

        if (!justificanteDB) return res.status(404).json({msg: 'No encontrado'});

        const asistenciaDB = await AsistenciasModel.findById(justificanteDB.idAsistencia);
        const estadoJustificante = await EstadosJustificanteModel.findOne({nombre: 'Rechazado'});
        const estadoAsistenciaDB = await EstadosAsistenciaModel.findOne({nombre: 'Inasistencia'});

        justificanteDB.idEstadoJustificante = estadoJustificante._id;
        asistenciaDB.idEstadoAsistencia = estadoAsistenciaDB._id;

        await Promise.all([justificanteDB.save(), asistenciaDB.save()]);

        return res.status(200).json({msg: 'Justificante Rechazado'});

        /**POR SI NO SE QUIERE ESTAR ACTUALIZANDO EL ESTADO */

        // if (justificanteDB.idEstadoJustificante.nombre == 'Enviado') {

        //     const asistenciaDB = await AsistenciasModel.findById(justificanteDB.idAsistencia);
        //     const estadoJustificante = await EstadosJustificanteModel.findOne({nombre: 'Rechazado'});
        //     const estadoAsistenciaDB = await EstadosAsistenciaModel.findOne({nombre: 'Inasistencia'});

        //     justificanteDB.idEstadoJustificante = estadoJustificante._id;
        //     asistenciaDB.idEstadoAsistencia = estadoAsistenciaDB._id;

        //     await Promise.all([justificanteDB.save(), asistenciaDB.save()]);

        //     return res.status(200).json({msg: 'Justificante Rechazado'});
        // } else {
        //     return res.status(401).json({msg: 'El justificante ya se ha tratado'});
        // }
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: 'Error'})
    }
})


export const justificantesRouter = Router().use('/justificantes', rutas);