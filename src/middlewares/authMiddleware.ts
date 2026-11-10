
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensagem: 'Token não fornecido.'
        });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({
            mensagem: 'Erro no formato do token.'
        });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({
            mensagem: 'Token mal formatado.'
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET não configurado no ambiente.');

        return res.status(500).json({
            mensagem: 'Erro interno de configuração do servidor.'
        });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                mensagem: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        const user = decoded as any;

        (req as any).userId = user.id;
        (req as any).user = user;

        return next();
    });
};
