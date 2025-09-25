import express from "express";
import cors from "cors";
import multer from "multer";
import { listarEventos, insertarEvento } from "./src/funciones.js";

const app = express();
const PORT = 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Funcionando");
});

app.get("/api/eventos", async (req, res) => {
  try {
    const eventos = await listarEventos();
    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar eventos" });
  }
});

app.post("/api/eventos", upload.single("file"), async (req, res) => {
  try {
    const { name } = req.body;
    //const image = req.file;
    if (!name) {
      return res.status(400).json({ error: "El campo 'name' es requerido" });
    }

    /*if (!image) {
      return res.status(400).json({ error: "El campo 'image' es requerido" });
    }*/
    const image = "temp";
    const nuevoEvento = await insertarEvento(name, image);
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear evento" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
