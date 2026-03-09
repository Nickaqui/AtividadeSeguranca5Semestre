import { Request, Response } from "express";
import db from "../database";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // query parameterizada para evitar SQL Injection
    const query = "SELECT * FROM usuario WHERE email = $1";

    try {
        const result = await db.query(query, [email]);

        if (!result.rowCount) {
            return res.status(401).json({ success: false, message: "Falha no login" });
        }

        const user = result.rows[0];

        // compara a senha em memória (idealmente deveriam ser hashes)
        if (user.senha !== password) {
            return res.status(401).json({ success: false, message: "Falha no login" });
        }

        // nunca exponha a senha na resposta
        delete user.senha;

        return res.json({ success: true, user });

    } catch (err) {
        return res.status(500).json({ success: false });
    }
};
export const novoLogin = async (req: Request, res: Response) => {
    const { email, password, nome } = req.body;

    const nomeNormalizado = normalizarNome(nome);
    // usar placeholder também para consulta de iptu
    const queryNomeIpuExiste = "SELECT * FROM iptu WHERE nome = $1";
    const iptuResult = await db.query(queryNomeIpuExiste, [nomeNormalizado]);

    if (iptuResult.rowCount && iptuResult.rowCount > 0) {
        // inserção parametrizada
        const insertQuery =
            "INSERT INTO usuario (email, senha, nome, tipo_usuario_id) VALUES ($1, $2, $3, 3) RETURNING *";

        const result = await db.query(insertQuery, [email, password, nome]);

        // já temos o usuário retornado, não precisamos de nova consulta
        const user = result.rows[0];
        const idUsuario = user.id;

        // atualizar iptu também em query parametrizada
        const updateIptuQuery =
            "UPDATE iptu SET usuario_id = $1 WHERE nome = $2";
        const resultUpdate = await db.query(updateIptuQuery, [idUsuario, nomeNormalizado]);

        if (result.rowCount && result.rowCount > 0 && resultUpdate.rowCount && resultUpdate.rowCount > 0) {
            delete user.senha; // garantir que senha não saia na resposta
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Falha no login" });
        }
    } else {
        res.status(404).json({ success: false, message: `Nome '${nome}' não encontrado no cadastro de municipes` });
    }
};

export const atualizarIptu = async (req: Request, res: Response) => {
    const { usuarioId: usuarioId, novoValor: novoValor } = req.body;

    const query = "UPDATE iptu SET valor = $1 WHERE usuario_id = $2";

    try {
        await db.query(query, [novoValor, usuarioId]);
        res.json({ message: "IPTU atualizado" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
export const getIptuPorIdUsuario = async (req: Request, res: Response) => {
    const { usuarioId: usuarioId } = req.body;

    const query = "SELECT * FROM iptu WHERE usuario_id = $1";

    try {
        const result = await db.query(query, [usuarioId]);
        res.json({ iptu: result.rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export function normalizarNome(nome: string): string {
    return nome
        .normalize("NFD") // separa letra do acento
        .replace(/[\u0300-\u036f]/g, "") // remove os acentos
        .toUpperCase() // deixa tudo maiúsculo
        .trim(); // remove espaços extras no começo/fim
}