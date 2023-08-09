import { model, Schema } from "mongoose";

const schema = new Schema({
    longitud: String,
    latitud: String,
    rango: Number,
});

export const UbicacionesModel = model('ubicaciones', schema);