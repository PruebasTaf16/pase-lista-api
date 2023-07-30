import { Schema, model } from "mongoose";

const schema = new Schema({
    fecha: {
        type: Date,
        required: true,
        unique: true,
    },
    habilitado: {
        type: Boolean,
        required: true,
        default: true,
    }
})

export const DiasModel = model('dias', schema)