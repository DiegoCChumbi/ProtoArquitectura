import express from "express";
import cors from "cors";
import multer from "multer";
import { listarEventos, insertarEvento } from "./src/funciones.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import cookieParser from "cookie-parser";

// --------------------------------------------------------
// 1. CONFIGURACIÓN DE CONSTANTES Y CLAVES
// --------------------------------------------------------
// NOTA: Recuerda que estas claves deben ir en un archivo .env
const FRONTEND_URL = "http://localhost:5173";
const API_BASE_URL = "http://localhost:3000";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ; 
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; 

const app = express();
const PORT = 3000;

// Configuración de Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------------------------------------------
// 2. CONFIGURACIÓN DE MIDDLEWARES BASE
// --------------------------------------------------------

// Habilitar CORS para permitir credenciales/cookies
app.use(cors({
    origin: FRONTEND_URL, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Permite el intercambio de cookies de sesión
}));

// Middlewares estándar
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------------
// 3. CONFIGURACIÓN DE SESIONES Y PASSPORT
// --------------------------------------------------------

app.use(session({
    secret: "ALGUN_SECRETO_MUY_LARGO_Y_ALEATORIO", 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Cambiar a true en producción (HTTPS)
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// --------------------------------------------------------
// 4. ESTRATEGIA DE PASSPORT GOOGLE
// --------------------------------------------------------

passport.serializeUser((user, done) => {
    done(null, user); 
});

passport.deserializeUser((user, done) => {
    done(null, user); 
});


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_BASE_URL}/auth/google/callback`, 
},
(accessToken, refreshToken, profile, done) => {
    // Aquí puedes manejar la lógica de DB (ej. crear un nuevo usuario si no existe)
    return done(null, profile);
}));


// --------------------------------------------------------
// 5. RUTAS DE AUTENTICACIÓN
// --------------------------------------------------------

// A. Inicio del proceso de Google
app.get("/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// B. Callback de Google
app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: FRONTEND_URL }),
    (req, res) => {
        // Autenticación exitosa, redirigir al frontend.
        res.redirect(FRONTEND_URL);
    }
);

// C. Ruta para obtener el Usuario (consumida por React)
app.get("/api/user", (req, res) => {
    if (req.user) {
        // Si hay un usuario en la sesión
        res.json({
            id: req.user.id,
            name: req.user.displayName,
            email: req.user.emails && req.user.emails.length > 0 ? req.user.emails[0].value : 'N/A',
            photo: req.user.photos && req.user.photos.length > 0 ? req.user.photos[0].value : 'https://placehold.co/50x50',
        });
    } else {
        // No autenticado
        res.status(401).json({ error: "No autenticado" });
    }
});

// D. Ruta de cierre de sesión
app.post("/auth/logout", (req, res, next) => {
    req.logout((err) => { 
        if (err) { return next(err); }
        req.session.destroy(() => {
             res.status(200).send({ message: "Sesión cerrada" });
        });
    });
});

// --------------------------------------------------------
// 6. RUTAS DE EVENTOS (Desprotegida)
// --------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Servidor Express funcionando con Passport.js");
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

// Esta ruta NO tiene el middleware 'isAuthenticated'. Siempre es accesible.
app.post("/api/eventos", upload.single("file"), async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file;

        // Opcional: Obtener datos del usuario si está logueado, si no, serán null/undefined
        const loggedInUser = req.user ? {
            id: req.user.id, 
            email: req.user.emails[0].value
        } : null;

        if (!name || !image) {
            return res.status(400).json({ error: "Faltan campos (name o file)." });
        }
        
        // La función insertarEvento puede recibir el usuario o null
        const nuevoEvento = await insertarEvento(name, image, loggedInUser); 
        res.status(201).json(nuevoEvento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear evento" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en ${API_BASE_URL}`);
});
