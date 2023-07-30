import { Schema, model } from "mongoose";

const schema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    horarioEntrada: {
        type: Date,
        required: true
    },
    horarioSalida: {
        type: Date,
        required: true,
    },
    tiempoAntesEntrada: {
        type: Number,
        required: true,
    },
    tiempoMaxTolerancia: {
        type: Number,
        required: true,
    }
})

export const RolesModel = model('roles', schema)