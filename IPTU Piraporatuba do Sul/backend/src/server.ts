import express from "express";
import cors from "cors";
import userRoutes from "./routes/usuarioRoutes";
import commentRoutes from "./routes/comentarioRoutes";
import hackerMalvadao from "./routes/hackerMalvadaoRoutes";

const app = express();
(global as any).segredoJwt = "Tnlmaslkcalsdfkalj0129iT";

const cookiesParser = require("cookie-parser");
app.use(cookiesParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/usuario", userRoutes);
app.use("/comentario", commentRoutes);
app.use("/hacker-malvadao", hackerMalvadao);

app.listen(3001, () => {
    console.log("Servidor Vulnerável rodando na porta 3001");
});