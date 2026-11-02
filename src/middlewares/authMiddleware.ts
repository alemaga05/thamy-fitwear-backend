import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Token não fornecido.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ mensagem: 'Erro no formato do token.' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ mensagem: 'Token mal formatado.' });
    }

    jwt.verify(token, 'SEU_SEGREDO_JWT', (err, decoded: any) => {
        if (err) {
            console.error('Erro ao verificar JWT:', err.message);
            return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
        }

        // ⬅️ CORREÇÃO AQUI: Atribui diretamente o id e o user completo
        (req as any).userId = decoded.id;
        (req as any).user = decoded;
        
        return next();
    });
};