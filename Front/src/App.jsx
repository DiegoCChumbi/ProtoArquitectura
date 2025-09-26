import { useEffect, useState } from "react";
// Importaciones de logo quitadas, no son necesarias
import "./App.css";

// --------------------------------------------------------
// 1. URL base de tu backend Express
// --------------------------------------------------------
const API_BASE_URL = "http://localhost:3000";

function App() {
  const [eventos, setEventos] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  // Nuevo estado para el usuario autenticado
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // --------------------------------------------------------
  // Funciones de Autenticación
  // --------------------------------------------------------

  // Función que verifica si hay un usuario logueado
  const checkAuthStatus = async () => {
    try {
      // Necesitas enviar credenciales para que las cookies de sesión funcionen
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData); // { id, name, email, photo }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error al verificar el estado de autenticación:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // --------------------------------------------------------
  // useEffects
  // --------------------------------------------------------

  useEffect(() => {
    // 1. Cargar el estado del usuario al montar el componente
    checkAuthStatus();

    // 2. Cargar la lista de eventos
    fetch(`${API_BASE_URL}/api/eventos`)
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) => console.error(err));
  }, []);

  // --------------------------------------------------------
  // Handlers de Eventos y Subida de Archivos
  // --------------------------------------------------------

  const handleLogin = () => {
    // Redirige al usuario a la ruta de inicio de sesión de Google en tu backend.
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      // Llama a una ruta de logout en tu backend que destruya la sesión
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null); // Limpiar estado del usuario
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
    }
  };

  const handleFileChange = (e) => {
    setArchivoImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoEvento.trim() || !archivoImagen) {
      alert("Faltan campos: nombre o imagen.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", nuevoEvento);
      formData.append("file", archivoImagen); // Clave 'file' para tu backend de Multer

      const res = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        body: formData,
        // Usar credentials: 'include' es esencial para enviar la cookie de sesión
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `Error ${res.status}: ${errorData.error || "Fallo al crear evento"}`
        );
      }

      const eventoCreado = await res.json();
      setEventos((prev) => [...prev, eventoCreado]);
      setNuevoEvento("");
      setArchivoImagen(null);
      e.target.reset(); // Limpia el input del archivo
    } catch (error) {
      console.error("Fallo al enviar el evento:", error);
      alert(`Error al guardar evento: ${error.message}`);
    }
  };

  // --------------------------------------------------------
  // Componente de Perfil/Login (JSX)
  // --------------------------------------------------------

  const renderAuthSection = () => {
    if (loadingUser) {
      return <div style={{ color: "#6b7280" }}>Cargando usuario...</div>;
    }

    if (user) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "#ecfdf5",
            borderRadius: "10px",
            border: "1px solid #34d399",
          }}
        >
          <img
            src={user.photo} // Asumimos que el campo se llama 'photo'
            alt={user.name}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <strong style={{ display: "block" }}>{user.name}</strong>
            <small style={{ color: "#047857" }}>{user.email}</small>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleLogin}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#4285F4", // Color de Google
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <svg
          viewBox="0 0 48 48"
          width="20"
          height="20"
          style={{ fill: "white" }}
        >
          <path
            d="M44.5 20H24v8.5h11.8C34.7 34 31.2 38 24 38c-8.8 0-16-7.2-16-16s7.2-16 16-16c4.3 0 8.1 1.7 11 4.5l6.5-6.5C36 2.6 30.5 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.2 0 23.3-9.5 23.3-23.3 0-1.7-.1-3.3-.4-4.8z"
            fill="#fff"
          />
        </svg>
        Iniciar Sesión con Google
      </button>
    );
  };

  // --------------------------------------------------------
  // Renderizado Principal
  // --------------------------------------------------------

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        fontFamily: "Inter, sans-serif",
        padding: "1.5rem",
        borderRadius: "12px",
        backgroundColor: "#f9fafb",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Sección de Autenticación */}
      {renderAuthSection()}

      <h1
        style={{
          color: "#1f2937",
          paddingBottom: "0.5rem",
          marginTop: "2rem",
        }}
      >
        Eventos
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <input
          type="text"
          value={nuevoEvento}
          onChange={(e) => setNuevoEvento(e.target.value)}
          placeholder="Nombre del evento"
          style={{
            padding: "0.75rem",
            width: "100%",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
          }}
          required
        />
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            border: "1px dashed #9ca3af",
            borderRadius: "6px",
            backgroundColor: "#eff6ff",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Seleccionar Imagen (.png o .jpg)
          </label>
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={handleFileChange}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            width: "100%",
            backgroundColor: "#10b981", // Verde para crear
            color: "white",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#10b981")}
        >
          Agregar Evento
        </button>
      </form>

      <h2 style={{ color: "#4b5563" }}>Lista de Eventos</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {eventos.map((ev) => (
          <li
            key={ev.id}
            style={{
              border: "1px solid #e5e7eb",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              backgroundColor: "#fff",
            }}
          >
            {ev.imageUrl && (
              <img
                src={ev.imageUrl}
                alt={ev.name}
                style={{
                  width: "64px",
                  height: "64px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "2px solid #d1d5db",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/64x64/f3f4f6/6b7280?text=IMG";
                }}
              />
            )}
            <strong style={{ fontSize: "1.1rem", color: "#1f2937" }}>
              {ev.name}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
