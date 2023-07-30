import { Router } from "express"

import { RolesModel, UsuarioModel } from "../models/index.js"
import { generarHoraDeString } from "../utils/fechas-utils.js"

const rutas = Router({mergeParams: true})

/**Crea un nuevo rol */
rutas.post('/crear', async (req, res) => {
    const data = req.body

    const _horarioEntrada = generarHoraDeString(data.horarioEntrada)
    const _horarioSalida = generarHoraDeString(data.horarioSalida)
    
    try {
        const rolDB = await RolesModel.find({
            nombre: {
                $regex: data.nombre,
                $options: 'i'
            }
        })

        if (!rolDB) return res.status(400).json({msg: 'Rol existente'})

        const rol = new RolesModel({
            nombre: data.nombre,
            horarioEntrada: _horarioEntrada,
            horarioSalida: _horarioSalida,
            tiempoAntesEntrada: data.tiempoAntesEntrada,
            tiempoMaxTolerancia: data.tiempoMaxTolerancia,
        })

        await rol.save();

        res.status(201).json({
            msg: 'Rol creado'
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: e.code === 11000 ? 'Ya existe un rol con ese nombre' : 'Error'
        })
    }
})
/**Trae todo el listado de roles */
rutas.post('/todos', async (req, res) => {
    try {
        const roles = await RolesModel.find({})

        res.status(200).json({data: roles})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Edita un rol */
rutas.patch('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body

    const _horarioEntrada = generarHoraDeString(data.horarioEntrada)
    const _horarioSalida = generarHoraDeString(data.horarioSalida)
    
    try {
        const rolDB = await RolesModel.findById(id);

        if (!rolDB) return res.status(404).json({msg: 'Rol no encontrado'})
        
        Object.assign(rolDB, {...data, horarioEntrada: _horarioEntrada, horarioSalida: _horarioSalida})

        await rolDB.save();

        res.status(201).json({
            msg: 'Rol actualizado correctamente'
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: e.code === 11000 ? 'Ya existe un rol con ese nombre' : 'Error'
        })
    }
})
/**Elimina un rol */
rutas.delete('/eliminar/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const rolDB = await RolesModel.findById(id);

        if (!rolDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        if (rolDB.nombre === 'Default') return res.status(403).json({msg: 'No se puede eliminar el rol por defecto'});
 
        const rolReemplazo = await RolesModel.findOne({nombre: 'Default'});

        await UsuarioModel.updateMany(
            {idRol: id},
            {$set: {idRol: rolReemplazo._id}}
        )

        await rolDB.deleteOne()

        res.status(200).json({msg: 'Rol eliminado correctamente, y los usuarios pertenecientes a este rol tendrán el rol Default'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    } 
})


export const rolesRouter = Router().use('/roles', rutas)