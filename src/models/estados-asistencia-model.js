import { Schema, model } from "mongoose";

const schema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    }
})

export const EstadosAsistenciaModel = model('estados-asistencia', schema)