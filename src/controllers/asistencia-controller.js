import { Router } from "express";

import { AsistenciasModel, DiasModel, EstadosAsistenciaModel, EstadosJustificanteModel, JustificantesModel, MotivosInasistenciaModel, UsuarioModel } from "../models/index.js";
import { obtenerFechaLimpia, obtenerFechaFormateada } from "../utils/fechas-utils.js";

const rutas = Router({mergeParams: true})

/**Arroja un listado de toda la asistencia de la semana actual por usuario */
rutas.get('/listado-semanal/:id', async (req, res) => {
    const idUsuario = req.params.id;

    try {
        const usuarioDB = await UsuarioModel.findById(idUsuario);
        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'});

        const ahora = new Date();

        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay() + 1);
        inicioSemana.setHours(0, 0, 0, 0);

        const finSemana = new Date(ahora);
        finSemana.setDate(ahora.getDate() - ahora.getDay() + 7);
        finSemana.setHours(0, 0, 0, 0);

        const diasDB = await DiasModel.find({});
        
        let listadoSemanal = diasDB.filter(d => d.fecha >= inicioSemana && d.fecha <= finSemana);
        /**Del más reciente al más antiguo
         * 
         */
        listadoSemanal.sort((a, b) => b.fecha - a.fecha);

        let listado = [];
        for await (const dia of listadoSemanal) {
            const asistencia = await AsistenciasModel.findOne({
                idDia: dia._id,
                idUsuario: idUsuario,
            })
            .populate('idEstadoAsistencia');
            if (asistencia) listado.push(asistencia);
        }

        res.status(200).json({msg: 'Listado semanal', data: {
            asistenciaUsuario: listado,
            listadoSemanal,
        }});
    } catch (e) {
        console.log(e)
        res.status(500).json({msg: 'Error'})
    }
})
/**Registra la asistencia */
rutas.post('/registrar', async (req, res) => {
    const data = req.body;

    try {
        const usuarioDB = await UsuarioModel.findById(data.idUsuario).populate('idRol')
        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        const diaDB = await DiasModel.findById(data.idDia)
        if (!diaDB) return res.status(404).json({msg: 'Día no encontrado'})

        if (!diaDB.habilitado) return res.status(401).json({msg: 'El día se encuentra inhabilitado para asistencia'});

        const asistenciaDB = await AsistenciasModel.findOne({idDia: data.idDia, idUsuario: data.idUsuario});
        if (asistenciaDB) return res.status(401).json({msg: 'Ya se registró asistencia o justificación para este día'});

        const horaRegistro = new Date(obtenerFechaFormateada());
        horaRegistro.setHours(horaRegistro.getHours() - 6); //tricky
        console.log(horaRegistro);

        const horaMin = new Date(usuarioDB.idRol.horarioEntrada);
        horaMin.setFullYear(horaRegistro.getFullYear());
        horaMin.setMonth(horaRegistro.getMonth());
        horaMin.setDate(horaRegistro.getDate());
        horaMin.setMinutes(horaMin.getMinutes() - usuarioDB.idRol.tiempoAntesEntrada);
        console.log(horaMin);

        const horaEnPunto = new Date(usuarioDB.idRol.horarioEntrada);
        horaEnPunto.setFullYear(horaRegistro.getFullYear());
        horaEnPunto.setMonth(horaRegistro.getMonth());
        horaEnPunto.setDate(horaRegistro.getDate());
        console.log(horaEnPunto);

        const horaMax = new Date(usuarioDB.idRol.horarioEntrada);
        horaMax.setFullYear(horaRegistro.getFullYear());
        horaMax.setMonth(horaRegistro.getMonth());
        horaMax.setDate(horaRegistro.getDate());
        horaMax.setMinutes(horaMax.getMinutes() + usuarioDB.idRol.tiempoMaxTolerancia);
        console.log(horaMax);

        // console.log(horaRegistro);
        // console.log(horaMin);
        // console.log(horaEnPunto);
        // console.log(horaMax);

        let estadoAsistencia = null;

        if (horaRegistro.getTime() >= horaMin.getTime() && horaRegistro.getTime() <= horaEnPunto.getTime()) {
            estadoAsistencia = await EstadosAsistenciaModel.findOne({nombre: 'Asistencia normal'});
        } else if (horaRegistro.getTime() > horaEnPunto.getTime() && horaRegistro.getTime() <= horaMax.getTime()) {
            estadoAsistencia = await EstadosAsistenciaModel.findOne({nombre: 'Asistencia con retraso'});
        } else {
            estadoAsistencia = await EstadosAsistenciaModel.findOne({nombre: 'Inasistencia'});
        }

        const asistencia = new AsistenciasModel({
            idUsuario: data.idUsuario,
            idDia: data.idDia,
            idEstadoAsistencia: estadoAsistencia._id,
            horaAsistencia: horaRegistro
        });

        await asistencia.save();

        res.status(201).json({msg: 'Asistencia registrada', data: {
            estadoAsistencia,
            horaRegistro,
        }});
    } catch (e) {
        console.log(e);
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Genera un justificante para el día de hoy */
rutas.post('/justificar', async (req, res) => {
    const data = req.body;

    try {
        const usuarioDB = await UsuarioModel.findById(data.idUsuario).populate('idRol')
        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        const diaDB = await DiasModel.findById(data.idDia)
        if (!diaDB) return res.status(404).json({msg: 'Día no encontrado'})

        if (!diaDB.habilitado) return res.status(401).json({msg: 'El día se encuentra inhabilitado para asistencia'});

        const asistenciaDB = await AsistenciasModel.findOne({idDia: data.idDia, idUsuario: data.idUsuario});
        if (asistenciaDB) return res.status(401).json({msg: 'Ya se registró asistencia o justificación para este día'});

        const motivoInasistenciaDB = await MotivosInasistenciaModel.findById(data.idMotivoInasistencia);
        if (!motivoInasistenciaDB) return res.status(404).json({msg: 'Motivo no encontrado'});

        if (!data.detalles) return res.status(400).json({msg: 'Faltan los detalles'});

        const estadoAsistencia = await EstadosAsistenciaModel.findOne({nombre: 'Esperando Justificación'});

        const estadoJustificante = await EstadosJustificanteModel.findOne({nombre: 'Enviado'});

        const asistencia = new AsistenciasModel({
            idDia: data.idDia,
            idUsuario: data.idUsuario,
            idEstadoAsistencia: estadoAsistencia._id,
            horaAsistencia: obtenerFechaLimpia(new Date()),
        });

        await asistencia.save();

        const justificante = new JustificantesModel({
            idAsistencia: asistencia._id,
            idMotivoInasistencia: motivoInasistenciaDB._id,
            idEstadoJustificante: estadoJustificante._id,
            detalles: data.detalles,
        });

        await justificante.save();

        res.status(201).json({msg: 'Justificante Enviado'});
    } catch (e) {
        console.log(e);
        res.status(500).json({msg: 'Error'});
    }
})
rutas.post('/dia', async (req, res) => {
    const datos = req.body;
    try {
        const listadoUsuarios = await UsuarioModel.find({}).populate('idRol');

        const fechaGenerada = obtenerFechaLimpia(new Date(datos.fecha));
        const diaDB = await DiasModel.findOne({fecha: fechaGenerada});
        console.log(fechaGenerada, ' ---> en la DB', diaDB);
        if (!diaDB) {
            res.status(200).json({msg: "Sin día registrado",usuarios: [], asistencias: []});
            return;
        }

        const asistenciasFecha = await AsistenciasModel.find({idDia: diaDB._id})
        .populate('idUsuario').populate('idDia').populate('idEstadoAsistencia');

        res.status(200).json({dia: diaDB._id, usuarios: listadoUsuarios, asistencias: asistenciasFecha});
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
rutas.get('/hoy', async (req, res) => {
    try {
        const listadoUsuarios = await UsuarioModel.find({}).populate('idRol');

        const fechaGenerada = obtenerFechaLimpia(new Date())
        const diaDB = await DiasModel.findOne({
            fecha: fechaGenerada
        });

        if (!diaDB) {
            res.status(200).json({usuarios: [], asistencias: []});
            return;
        };
        /**Lista de asistencias para comparar */
        const asistenciasHoy = await AsistenciasModel.find({
            idDia: diaDB._id,
        }).populate('idUsuario').populate('idDia').populate('idEstadoAsistencia');

        res.status(200).json({usuarios: listadoUsuarios, asistencias: asistenciasHoy});
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
});
/**Se obtiene la información completa sobre la asistencia registrada del día de hoy */
rutas.get('/hoy/:usuario/:dia', async (req, res) => {
    const idUsuario = req.params.usuario
    const idDia = req.params.dia

    try {
        const asistenciaDB = await AsistenciasModel.findOne({
            idUsuario,
            idDia
        })
        .populate('idUsuario')
        .populate('idDia')
        .populate('idEstadoAsistencia')
        res.status(200).json({data: asistenciaDB ?? null})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})

export const asistenciaRouter = Router().use('/asistencias', rutas);