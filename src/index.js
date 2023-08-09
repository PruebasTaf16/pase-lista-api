import express from "express";

import cookies from "cookie-parser";
import cors from "cors";

import { conectarDB } from "./database/database.js";

import { autenticacionAdminRouter } from "./controllers/autenticacion-admin-controller.js";
import { autenticacionRouter } from "./controllers/autenticacion-controller.js";
import { rolesRouter } from "./controllers/roles-controller.js";
import { usuariosRouter } from "./controllers/usuarios-controller.js";
import { diasRouter } from "./controllers/dias-controller.js";
import { asistenciaRouter } from "./controllers/asistencia-controller.js";
import { justificantesRouter } from "./controllers/justificantes-controller.js";
import { variosRouter } from "./controllers/varios-controller.js";
import { graficasRouter } from "./controllers/graficas-controller.js";
import { ubicacionesRouter } from "./controllers/ubicaciones-controller.js";

import { DiasModel } from "./models/dias-model.js";
import { obtenerFechaLimpia } from "./utils/fechas-utils.js";

const app = express();

/**Tenemos una función para iniciar el servidor que usará express, como toda la configuración */
async function iniciarServer() {
  /**Conectar a la base de datos */
  const db = await conectarDB();

  /**Permitir leer JSON en las peticiones dentro del Body */
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  /**Manejar cookies y peticiones desde distintos orígenes (CORS) */
  app.use(cookies());
  app.use(
    cors({
      origin: "*",
    })
  );

  /**Pequeña función intermediaria entre las peticiones para permitir cualquier tipo de acción */
  app.use("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method"
    );
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

    next();
  });

  /**Ruta de prueba */
  app.get("/", (req, res) =>
    res.status(200).json({ msg: "PASE DE LISTA API" })
  );

  /**USO DE TODOS LOS CONTROLADORES Y SUS RUTAS */
  app.use("/", autenticacionAdminRouter);
  app.use("/", autenticacionRouter);
  app.use("/", usuariosRouter);
  app.use("/", rolesRouter);
  app.use("/", diasRouter);
  app.use("/", asistenciaRouter);
  app.use("/", justificantesRouter);
  app.use("/", variosRouter);
  app.use("/", graficasRouter);
  app.use("/", ubicacionesRouter);

  /**RUTA EN CASO DE NO ENCONTRAR NINGUNA COINCIDENCIA */
  app.use("*", (req, res) => {
    res.status(404).send("No encontrado");
  });

  /**ESCUCHAR EN EL PUERTO 8000 Y USAR EL HOST DEL IPV4 EN LA RED LOCAL */
  app.listen(8000, "0.0.0.0", () => {
    console.log("API corriendo");

    setInterval(async () => {
      const fechaGenerada = obtenerFechaLimpia(new Date());

      try {
        const diaDB = await DiasModel.findOne({
          fecha: fechaGenerada,
        });

        if (diaDB) {
          if (diaDB.fecha.toDateString() === fechaGenerada.toDateString()) console.log("HOY");
        } else {
          // const dia = new DiasModel({fecha: fechaGenerada, habilitado: fechaGenerada.getDay() === 0 ? false : true})
          const dia = new DiasModel({ fecha: fechaGenerada, habilitado: true });
            console.log("===FECHA DE HOY GENERADA CORRECTAMENTE===")
          await dia.save();
        }
      } catch (e) {
        console.log(e);
      }
    }, 5000);
  });
}

iniciarServer();
