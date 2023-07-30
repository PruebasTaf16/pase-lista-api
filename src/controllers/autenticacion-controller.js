import { Router } from "express"

import * as bcrypt from "bcrypt"
import * as crypto from "crypto"

import { UsuarioModel } from "../models/index.js"
import { sendEmail } from "../email/email.js"
import { generarJWT, validarJWTToken } from "../helpers/token.js"
import { FRONTEND_URL } from "../constants/frontend.js"

const rutas = Router({mergeParams: true})

/**Inicia Sesión para los usuarios */
rutas.post('/iniciar-sesion', async (req, res) => {
    const data = req.body

    try {
        const usuarioDB = await UsuarioModel.findOne({
            email: data.email
        })

        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        const passwordValido = await bcrypt.compare(data.password, usuarioDB.password)

        if (!passwordValido) return res.status(401).json({msg: 'Contraseña incorrecta'})

        const jwt = await generarJWT({id: usuarioDB._id})

        res.status(200).json({
            msg: 'Acceso válido',
            data: {
                jwt
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Recupera la cuenta para los usuarios */
rutas.post('/recuperar-cuenta', async (req, res) => {
    const data = req.body;

    try {
        const usuarioDB = await UsuarioModel.findOne({
            email: data.email,
        })

        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        const token = crypto.randomBytes(20).toString('hex')

        usuarioDB.token = token

        await usuarioDB.save()

        await sendEmail(data.email, 'Recuperación de cuenta', `
            Accede al siguiente link para poder recuperar tu cuenta:\n
            ${FRONTEND_URL}/recuperar-cuenta-trabajador/${token}
        `)

        res.status(200).json({msg: 'Correo de recuperación enviado a ' + data.email})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Valida el token de recuperación enviado al correo */
rutas.get('/recuperar-cuenta/:token', async (req, res) => {
    const token = req.params.token

    if (!token) return res.status(400).json({msg: 'Sin token'})

    try {
        const usuarioDB = await UsuarioModel.findOne({
            token
        })

        if (!usuarioDB) return res.status(404).json({msg: 'Token no encontrado'})

        res.status(200).json({msg: 'Ok'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Valida el token de recuperación y actualiza la contraseña */
rutas.post('/actualizar-password/:token', async (req, res) => {
    const token = req.params.token
    const data = req.body

    if (!token) return res.status(400).json({msg: 'Sin token'})

    try {
        const usuarioDB = await UsuarioModel.findOne({
            token
        })

        if (!usuarioDB) return res.status(404).json({msg: 'Token no encontrado'})

        const hashed = await bcrypt.hash(data.password, 10)

        console.log('antes de la recuperación: ', usuarioDB.password)
        console.log('después de la recuperación', hashed)

        usuarioDB.token = null
        usuarioDB.password = hashed

        await usuarioDB.save()

        res.status(200).json({msg: 'Cuenta recuperada'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Se obtiene la información completa del usuario que accede al sistema */
rutas.get('/obtener-info', validarJWTToken, async (req, res) => {
    const {id} = req.user

    try {
        const usuarioDB = await UsuarioModel.findById(id).populate('idRol');
        
        if (!usuarioDB) return res.status(404).json({msg: 'Usuario no encontrado'})

        res.status(200).json({data: usuarioDB})
    } catch (e) {
        console.log(e)
        res.status(500).json({msg: 'Error'})
    }
})

export const autenticacionRouter = Router().use('/auth', rutas);