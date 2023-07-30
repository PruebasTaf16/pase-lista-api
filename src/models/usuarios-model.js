import { Schema, model } from "mongoose";

const schema = new Schema({
    idRol: {
        type: Schema.Types.ObjectId,
        ref: 'roles',
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    paterno: {
        type: String,
        required: true,
    },
    materno: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: String,
})

export const UsuarioModel = model('usuarios', schema)