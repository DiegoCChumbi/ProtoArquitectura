import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e) => {
    setArchivoImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.trim() || !archivoImagen) return;

    try {
      // 3. Crear un objeto FormData para enviar datos mixtos (texto + archivo)
      const formData = new FormData();
      formData.append("name", nuevoEvento); // Clave 'name' para el backend
      formData.append("file", archivoImagen); // Clave 'image' para el archivo

      // 4. Enviar la solicitud POST
      const res = await fetch("http://localhost:3000/api/eventos", {
        method: "POST",
        // IMPORTANTE: NO establecemos el 'Content-Type'.
        // El navegador lo establece automáticamente como 'multipart/form-data'
        // con el boundary correcto cuando usamos FormData.
        body: formData,
      });

      if (!res.ok) throw new Error("Error al crear evento");

      const eventoCreado = await res.json();
      setEventos((prev) => [...prev, eventoCreado]);
      setNuevoEvento("");
      setArchivoImagen(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Eventos</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={nuevoEvento}
          onChange={(e) => setNuevoEvento(e.target.value)}
          placeholder="Nombre del evento"
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
          required
        />
        {/* 5. Input para el archivo con el handler de cambio */}
        <input
          type="file"
          accept=".png, .jpg, .jpeg" // Filtra los tipos de archivo permitidos
          onChange={handleFileChange}
          style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
          required
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", width: "100%" }}>
          Agregar Evento
        </button>
      </form>

      <h2>Lista de Eventos</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {/* 6. Mostrar el nombre y la imagen */}
        {eventos.map((ev) => (
          <li
            key={ev.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {/* Asumimos que el backend devuelve un campo 'imageUrl' o similar */}
            {ev.imageUrl && (
              <img
                src={ev.imageUrl}
                alt={ev.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}
            <strong>{ev.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
