import { Router } from "express"

import * as bcrypt from "bcrypt"

import { AsistenciasModel, RolesModel, UsuarioModel } from "../models/index.js"
import { sendEmail } from "../email/email.js"

const rutas = Router({mergeParams: true})

/**Registrar cuenta de usuario */
rutas.post('/registrar', async (req, res) => {
    const data = req.body

    try {
        const usuarioDB = await UsuarioModel.findOne({
            email: {
                $regex: data.email,
                $options: 'i',
            }
        })

        const rolDB = await RolesModel.findById(data.idRol)

        if (!rolDB) return res.status(404).json({msg: 'Rol no encontrado'})

        const hashed = await bcrypt.hash(data.password, 10)

        const usuario = new UsuarioModel({
            idRol: data.idRol,
            nombre: data.nombre,
            paterno: data.paterno,
            materno: data.materno,
            email: data.email,
            password: hashed,
        })

        await usuario.save()

        await sendEmail(data.email, 'Cuenta Creada', `
            Saludos, ${data.nombre} ${data.paterno} ${data.materno}:\n
            Su cuenta ha sido creada correctamente, por lo que su contraseña será:\n
            ${data.password}
        `)

        res.status(201).json({
            msg: 'Usuario creado'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: e.code === 11000 ? 'Ya existe un usuario con ese email' : 'Error'
        })
    }
})
/**Trae todo el listado de usuarios que hay */
rutas.post('/todos', async (req, res) => {
    try {
        const usuarios = await UsuarioModel.find({}).populate('idRol');
        console.log(usuarios)
        res.status(200).json({data: usuarios})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Elimina un usuario */
rutas.delete('/eliminar/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const usuarioDB = await UsuarioModel.findById(id);

        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        await usuarioDB.deleteOne()

        await AsistenciasModel.deleteMany({idUsuario: id});

        res.status(200).json({msg: 'Usuario eliminado correctamente'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    } 
})
/**Edita la información de un usuario */
rutas.patch('/editar/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const usuarioDB = await UsuarioModel.findById(id);

        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        Object.assign(usuarioDB, data);

        await usuarioDB.save()

        res.status(200).json({msg: 'Usuario actualizado correctamente'});
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    } 
})


export const usuariosRouter = Router().use('/usuarios', rutas);