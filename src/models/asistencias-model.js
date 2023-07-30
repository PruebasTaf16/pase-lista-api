import { Schema, model } from "mongoose";

const schema = new Schema({
    idUsuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true,
    },
    idDia: {
        type: Schema.Types.ObjectId,
        ref: 'dias',
        required: true,
    },
    idEstadoAsistencia: {
        type: Schema.Types.ObjectId,
        ref: 'estados-asistencia',
        required: true,
    },
    horaAsistencia: {
        type: Date,
    }
})

export const AsistenciasModel = model('asistencias', schema)