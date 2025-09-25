import { listarEventosDB, insertarEventoDB } from "./db.js";
import { uploadFIle, getSignedUrlForFile } from "./s3.js";

async function insertarEvento(nombre, image) {
  try {
    //const fileName = `${Date.now()}-${image.originalname}`;
    const filename = "default.png";
    //await uploadFIle(fileName, image.buffer, image.mimetype);
    const nuevoEvento = await insertarEventoDB(nombre, filename);
    return nuevoEvento;
  } catch (error) {
    console.error("Error al subir la imagen a S3:", error);
    throw new Error("Error al subir la imagen");
  }
}

async function listarEventos() {
  const eventos = await listarEventosDB();

  const result = await Promise.all(
    eventos.map(async (e) => {
      //const url = await getSignedUrlForFile(e.imageKey);
      return {
        id: e.id,
        name: e.name,
        imageUrl: e.fileName,
      };
    })
  );

  return result;
}

export { insertarEvento, listarEventos };
