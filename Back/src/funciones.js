import { listarEventosDB, insertarEventoDB } from "./db.js";
import { uploadFIle, getSignedUrlForFile } from "./s3.js";

async function insertarEvento(nombre, image) {
  try {
    const fileName = `${Date.now()}-${image.originalname}`;
    //const fileName = "default.png";
    await uploadFIle(fileName, image.buffer, image.mimetype);
    const nuevoEvento = await insertarEventoDB(nombre, fileName);
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
      const url = await getSignedUrlForFile(e.filename);
      return {
        id: e.id,
        name: e.name,
        imageUrl: url,
      };
    })
  );

  return result;
}

export { insertarEvento, listarEventos };
