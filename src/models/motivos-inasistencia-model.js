import { Schema, model } from "mongoose";

const schema = new Schema({
    nombre: {
        type: String,
        required: true,
    }
})

export const MotivosInasistenciaModel = model('motivos-inasistencia', schema)