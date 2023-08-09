import { Router } from "express";

import { UbicacionesModel } from "../models/index.js";

const rutas = Router({mergeParams: true});

/**Obtener la ubicación */
rutas.get('/actual', async (req, res) => {
    try {
        const ubicaciones = await UbicacionesModel.find({});
        const data = ubicaciones[0];

        res.status(200).json({
            msg: "Ubicación actual",
            data
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
});

/**Modificar la ubicación */
rutas.patch('/modificar', async (req, res) => {
    const datos = req.body;

    try {
        const ubicaciones = await UbicacionesModel.find({});
        const data = ubicaciones[0];

        data.latitud = datos.latitud;
        data.longitud = datos.longitud;
        data.rango = datos.rango;

        await data.save();

        res.status(200).json({
            msg: "Ubicación modificada",
            data
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
});

export const ubicacionesRouter = Router().use('/ubicaciones', rutas);