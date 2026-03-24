import { Request, Response } from "express";
import db from "../database";
import jwt from "jsonwebtoken";
import jwtService from "../Services/jwtServices";
import { RetornoPayload } from "../Tipos/retornoPayload";
import ValidarToken  from "../Services/jwtServices";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(`Recebendo login para email: ${JSON.stringify(req.body)}`);
    const query = 
        `SELECT * FROM usuario WHERE email = $1 AND senha = $2`;

    console.log(`Query Executada: ${query}`);

    const result = await db.query(query, [email, password]);

    if (result.rowCount && result.rowCount > 0) {
        const token = jwt.sign(
            { 
            id: result.rows[0].id, 
            email: result.rows[0].email, 
            tipo: result.rows[0].tipo_usuario_id 
            }
            , (global as any).segredoJwt);
        res.json({ success: true, user: result.rows[0], token });
    } else {
        res.status(401).json({ success: false, message: "Falha no login" });
    }
};
export const novoLogin = async (req: Request, res: Response) => {
    const { email, password, nome } = req.body;

    const nomeNormalizado = normalizarNome(nome);
    const queryNomeIpuExiste = `SELECT * FROM iptu WHERE nome = $1`;
    const iptuResult = await db.query(queryNomeIpuExiste, [nomeNormalizado]);

    if (iptuResult.rowCount && iptuResult.rowCount > 0) {
        const query = `INSERT INTO usuario (email, senha, nome, tipo_usuario_id) VALUES ($1, $2, $3, 3)`;
        const result = await db.query(query, [email, password, nome]);

        console.log(`Query Executada: ${query}`);

        const queryIdUsuario = `SELECT id FROM usuario WHERE email = $1 AND senha = $2`;
        const resultIdUsuario = await db.query(queryIdUsuario, [email, password]);

        const queryUpdateTabelaIptu = `UPDATE iptu set usuario_id = $1 WHERE nome = $2`;
        const resultUpdate = await db.query(queryUpdateTabelaIptu, [resultIdUsuario.rows[0].id, nomeNormalizado]);

        if (result.rowCount && result.rowCount > 0 && resultUpdate.rowCount && resultUpdate.rowCount > 0) {
            const token = jwt.sign(
            { 
            id: result.rows[0].id, 
            email: result.rows[0].email, 
            tipo: result.rows[0].tipo_usuario_id 
            }
            , (global as any).segredoJwt);
            res.json({ success: true, user: result.rows[0], token });
        } else {
            res.status(401).json({ success: false, message: "Falha no login" });
        }
    } 
    else 
    {
        res.status(404).json({ success: false, message: `Nome '${nome}' 'não encontrado no cadastro de municipes` });
    }
};

export const atualizarIptu = async (req: Request, res: Response) => {
    const { usuarioId: usuarioId, novoValor: novoValor } = req.body;
    const token = req.headers.authorization;
    const payload = ValidarToken(token as string) as RetornoPayload | null;

    if(!payload) {
        return res.status(401).json({ success: false, message: "Token inválido" });
    }

    if(payload.tipo.valueOf() !== "1" && payload.tipo.valueOf() !== "2") {
        res.status(404).json({ success: false, message: `Você não possui acesso a esse recurso.` });
    }

    const query = `UPDATE iptu SET valor = $1 WHERE usuario_id = $2`;
    try {
        await db.query(query, [novoValor, usuarioId]);
        res.json({ message: "IPTU atualizado" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getIptuPorIdUsuario = async (req: Request, res: Response) => {
    const usuarioId = req.query.usuarioId as string;

    const token = req.headers.authorization;
    const payload = ValidarToken(token as string) as RetornoPayload | null;

    if(!payload) {
        return res.status(401).json({ success: false, message: "Token inválido" });
    }

    const query = `SELECT * FROM iptu WHERE usuario_id = $1`;
    console.log(`Query Executada: ${query}`);
    try {
        const result = await db.query(query, [usuarioId]);
        console.log(`Retorno: ${result}`);
        res.json({ iptu: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getIptus = async (req: Request, res: Response) => {
    const usuarioId = req.query.usuarioId as string;
    const token = req.headers.authorization;
    const payload = ValidarToken(token as string) as RetornoPayload | null;

    if(!payload) {
        return res.status(401).json({ success: false, message: "Token inválido" });
    }
    if(payload.tipo.valueOf() !== "1" && payload.tipo.valueOf() !== "2") {
        res.status(404).json({ success: false, message: `Você não possui acesso a esse recurso.` });
    }
    
    const query = `SELECT * FROM iptu`;
    console.log(`Query Executada: ${query}`);
    try {
        const result = await db.query(query);
        res.json({ iptu: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
export const getQRCodeOrCodBarras = async (req: Request, res: Response) => {
    const tipo = req.query.tipo as string;
      const token = req.headers.authorization;
    const payload = ValidarToken(token as string) as RetornoPayload | null;
    if(!payload) {
        return res.status(401).json({ success: false, message: "Token inválido" });
    }
    let codigoHtml = "";
  if(tipo !== "codigoDeBarras" && tipo !== "qrcode") {
    
    return res.status(400).json({ error: "Tipo inválido" });
  } 
  if (tipo === "codigoDeBarras") {
    codigoHtml = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=123456789" />`;
  } else if (tipo === "qrcode") {
    codigoHtml = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRCodeDemo" />`;
  }
const xss = require('xss');

    const textoLimpo = xss(tipo);
  res.send(`
    <h2>Tipo selecionado: ${textoLimpo}</h2>${codigoHtml}`);
};
export function normalizarNome(nome: string): string {
    return nome
        .normalize("NFD") // separa letra do acento
        .replace(/[\u0300-\u036f]/g, "") // remove os acentos
        .toUpperCase() // deixa tudo maiúsculo
        .trim(); // remove espaços extras no começo/fim
}