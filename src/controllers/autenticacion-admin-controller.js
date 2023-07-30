import { Router  } from "express"

import * as bcrypt from "bcrypt"
import * as crypto from "crypto"

import { AdminModel } from "../models/index.js"
import { sendEmail } from "../email/email.js"
import { validarJWTToken, generarJWT} from "../helpers/token.js"
import { FRONTEND_URL } from "../constants/frontend.js"

const rutas = Router({mergeParams: true})

/**Inicia Sesión y devuelve un JSON Web Token para almacenar la sesión en el cliente */
rutas.post('/iniciar-sesion', async (req, res) => {
    const data = req.body

    try {
        const adminDB = await AdminModel.findOne({
            email: {
                $regex: data.email,
                $options: 'i',
            }
        });

        if (!adminDB) return res.status(404).json({msg: 'Admin no encontrado'})

        const passwordValido = await bcrypt.compare(data.password, adminDB.password)

        if (!passwordValido) return res.status(401).json({msg: 'Contraseña incorrecta'})

        const jwt = await generarJWT({id: adminDB._id});

        res.status(200).json({
            msg: 'Acceso válido',
            data: {
                jwt
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: e.code === 11000 ? 'Ya existe un admin con ese email' : 'Error'
        })
    }
})
/**Registra una cuenta de administrador usando la clave maestra (taf16password) */
rutas.post('/registrar', async (req, res) => {
    const data = req.body

    if (!data.masterKey) return res.status(400).json({msg: 'Falta la clave maestra'})

    if (data.masterKey !== 'taf16password') return res.status(401).json({msg: 'La clave maestra es incorrecta'});
    
    try {
        const adminDB = await AdminModel.findOne({
            email: data.email
        });

        const hashed = await bcrypt.hash(data.password, 10)

        const admin = new AdminModel({
            email: data.email,
            password: hashed,
        })

        await admin.save()

        res.status(201).json({
            msg: 'Administrador creado'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: e.code === 11000 ? 'Ya existe un admin con ese email' : 'Error'
        })
    }
})
/**Recupera la cuenta */
rutas.post('/recuperar-cuenta', async (req, res) => {
    const data = req.body

    try {
        const adminDB = await AdminModel.findOne({
            email: data.email,
        })
        if (!adminDB) return res.status(404).json({msg: 'Admin no encontrado'})

        const token = crypto.randomBytes(20).toString('hex')

        adminDB.token = token

        await adminDB.save()

        await sendEmail(data.email, 'Recuperación de cuenta (Admin)', `
            Accede al siguiente enlace para actualizar la contraseña:\n
            ${FRONTEND_URL}/actualizar-password/${token}
        `)

        res.status(200).json({msg: 'Token de recuperación enviado a ' + data.email})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Valida el token de recuperación */
rutas.get('/recuperar-cuenta/:token', async (req, res) => {
    const token = req.params.token

    if (!token) return res.status(400).json({msg: 'Sin token'})

    try {
        const adminDB = await AdminModel.findOne({
            token
        })

        if (!adminDB) return res.status(404).json({msg: 'Token no encontrado'})

        res.status(200).json({msg: 'Ok'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Valida el token y actualiza la contraseña */
rutas.post('/actualizar-password/:token', async (req, res) => {
    const token = req.params.token
    const data = req.body

    if (!token) return res.status(400).json({msg: 'Sin token'})

    try {
        const adminDB = await AdminModel.findOne({
            token
        })

        if (!adminDB) return res.status(404).json({msg: 'Token no encontrado'})

        const hashed = await bcrypt.hash(data.password, 10)

        console.log('antes de la recuperación: ', adminDB.password)
        console.log('después de la recuperación', hashed)

        adminDB.token = null
        adminDB.password = hashed

        await adminDB.save()

        res.status(200).json({msg: 'Cuenta recuperada'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'Error'
        })
    }
})
/**Se obtiene toda la información del administrador */
rutas.get('/obtener-info', validarJWTToken, async (req, res) => {
    const {id} = req.user

    try {
        const adminDB = await AdminModel.findById(id)
        
        if (!adminDB) return res.status(404).json({msg: 'Admin no encontrado'})

        res.status(200).json({data: adminDB})
    } catch (e) {
        console.log(e)
        res.status(500).json({msg: 'Error'})
    }
})


export const autenticacionAdminRouter = Router().use('/admin-auth', rutas);