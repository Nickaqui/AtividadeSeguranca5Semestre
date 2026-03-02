import { Router } from "express";
import { login, atualizarIptu, novoLogin, getIptuPorIdUsuario } from "../controllers/usuarioController";

const router = Router();

router.post("/login", login);
router.post("/novo-login", novoLogin);
router.post("/atualizar-iptu", atualizarIptu);
router.post("/iptu-por-usuario", getIptuPorIdUsuario);

export default router;