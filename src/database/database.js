import mongoose from "mongoose";

/**Conectar a la base de datos */
export const conectarDB = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const DB_URL = 'mongodb+srv://admin:taf16@cluster0.rklqjbf.mongodb.net/pase-lista?retryWrites=true&w=majority';
            const DATABASE = await mongoose.connect(DB_URL);

            console.log('Conectado a la base de datos')
            resolve(DATABASE);
        } catch (error) {
            console.log(`Hubo un error al conectar a la base de datos`);
            console.log(error);

            reject({
                msg: 'Hubo un error al conectar a la base de datos',
                error
            });
        } 
    });
}