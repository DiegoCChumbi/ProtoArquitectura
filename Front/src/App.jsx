import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/eventos")
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nuevoEvento }),
      });

      if (!res.ok) throw new Error("Error al crear evento");

      const eventoCreado = await res.json();
      setEventos((prev) => [...prev, eventoCreado]);
      setNuevoEvento("");
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
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
        >
          Agregar
        </button>
      </form>

      <ul>
        {eventos.map((ev) => (
          <li key={ev.id}>{ev.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
