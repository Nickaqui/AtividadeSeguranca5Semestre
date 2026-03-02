import express from "express";
import cors from "cors";
import userRoutes from "./routes/usuarioRoutes";
import commentRoutes from "./routes/comentarioRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuario", userRoutes);
app.use("/comentario", commentRoutes);

app.listen(3001, () => {
    console.log("Servidor Vulnerável rodando na porta 3001");
});