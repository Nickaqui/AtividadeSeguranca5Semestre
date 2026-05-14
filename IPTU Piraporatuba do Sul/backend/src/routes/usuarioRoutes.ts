import { Router } from "express";
import { login, atualizarIptu, novoLogin, getIptuPorIdUsuario, getQRCodeOrCodBarras, getIptus, usuarioLogado } from "../controllers/usuarioController";
import { rateLimit } from "express-rate-limit";

const router = Router();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        res.status(429).json({
            sucesso: false,
            erro: "Você excedeu o número de tentativas.",
            tempo: "Tente novamente em 15 minutos."
        })}
});
router.post("/login", limiter, login);
router.post("/novo-login", novoLogin);
router.post("/atualizar-iptu", atualizarIptu);
router.get("/iptu-por-usuario", getIptuPorIdUsuario);
router.get("/codigo-qr-ou-barra", getQRCodeOrCodBarras);
router.get("/usuario-logado", usuarioLogado);
router.get("/iptus", getIptus);

export default router;