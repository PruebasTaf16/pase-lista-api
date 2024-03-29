import { Schema, model } from "mongoose";

const schema = new Schema({
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

export const AdminModel = model('admins', schema)