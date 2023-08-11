import { Router } from "express"

import { DiasModel } from "../models/index.js"
import { obtenerFechaLimpia } from "../utils/fechas-utils.js"

const rutas = Router({mergeParams: true})

/**Genera el día de hoy e inserta su info. en la base de datos */
rutas.post('/generar-hoy', async (req, res) => {

    const fechaGenerada = obtenerFechaLimpia(new Date())

    try {

        const diaDB = await DiasModel.findOne({
            fecha: fechaGenerada
        })

        if (diaDB) {
            if (diaDB.fecha.toDateString() === fechaGenerada.toDateString()) return res.status(403).json({msg: 'Ya se ha generado la fecha de Hoy'})
        } else {
            // const dia = new DiasModel({fecha: fechaGenerada, habilitado: fechaGenerada.getDay() === 0 ? false : true})
            const dia = new DiasModel({fecha: fechaGenerada, habilitado: true});

            await dia.save()

            res.status(201).json({
                msg: 'La fecha para hoy se ha generado correctamente',
                data: dia
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'error'
        })
    }
})
/**Se obtiene la información del día de hoy (aquí se saca el ID para generar el QR en la app de escritorio) */
rutas.get('/hoy', async (req, res) => {
    const fecha = new Date();
    fecha.setHours(fecha.getHours() - 6);
    const fechaGenerada = obtenerFechaLimpia(fecha);
    try {
        const diaDB = await DiasModel.findOne({
            fecha: fechaGenerada
        })
        console.log(diaDB);
        res.status(200).json({
            msg: 'Se ha obtenido el registro de la fecha de hoy',
            data: diaDB ?? null
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'error'
        })
    }
})

export const diasRouter = Router().use('/dias', rutas)