import { Schema, model } from "mongoose";

const schema = new Schema({
    idAsistencia: {
        type: Schema.Types.ObjectId,
        ref: 'asistencias',
        required: true,
    },
    idMotivoInasistencia: {
        type: Schema.Types.ObjectId,
        ref: 'motivos-inasistencia',
        required: true,
    },
    idEstadoJustificante: {
        type: Schema.Types.ObjectId,
        ref: 'estados-justificante',
        required: true,
    },
    detalles: {
        type: String,
        required: true,
    }
})

export const JustificantesModel = model('justificantes', schema)