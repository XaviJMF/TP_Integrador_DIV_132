import express from "express"; //importamos express
import environments from "./src/api/config/environments.js";
import cors from "cors";
import {loggerURL} from "./src/api/middlewares/middleware.js";
import { authRoutes, productRoutes, userRoutes, viewRoutes } from "./src/api/routes/index.js";
import { __dirname, join } from "./src/api/utils/index.js";
import session from "express-session";


/*=====================
	Config
=====================*/

const { port, session_key } = environments;
const app = express(); // Creamos una instancia de aplicacion de express en app
const PORT = port;
const frontendPath = join(__dirname, "../frontend");

app.set("view engine", "ejs"); // Configuramos EJS como motor de plantillas
app.set("views", join(__dirname, "src/views")); // Apuntamos a la carpeta de las vistas de EJS


/*=====================
	middlewares -> Funciones que se ejecutan entre la req y la res
=====================*/

app.use(cors()); // Middleware CORS basico para permitir todas las solicitudes

// Middleware logger para mostrar por consola las solicitudes de nuestro servidor
app.use(loggerURL);
// Parseamos el JSON que enviamos en los formularios para recibirlos como objemos
app.use(express.json()); // Parseamos el JSON recibido en el body automaticamente

// Middleware para servir archivos estaticos
app.use(express.static(join(__dirname, "src/public")));

app.use(express.urlencoded({extended: true})); // Parseamos el urlencoded enviando con los <form> HTML

// Middleware de sesion
app.use(session({
	secret: session_key, // Contraseña que firma las cookies para evitar manipulacion
	resave: false, // Evita guardar la sesion si no hubo cambios
	saveUninitialized: true // No guarda sesiones vacias
}));

/*=====================
	Rutas
=====================*/
/*
	Endpoints -> Combinacion entre URL + Verbo HTTP + Logica
*/

app.get("/", (req, res) => {
	res.send("Hola mundo desde un servidor de Express.js");
});

///rutas api
app.use("/api/products", productRoutes)

// Rutas de usuarios
app.use("/api/users", userRoutes);


// Rutas vistas
app.use("/dashboard", viewRoutes); // Redirigimos las consultas a /dashboard a la ruta de vistas


// Rutas autenticacion /login 
app.use("/", authRoutes);

// 1. Sirve automáticamente welcome.html, menu.html, carrito.html, ticket.html, css/, js/ e img/
app.use(express.static(frontendPath));

// 2. Hace que entrar a http://localhost:3000/ abra directamente welcome.html
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "welcome.html"));
});


app.listen(PORT,() => {
	console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
})



