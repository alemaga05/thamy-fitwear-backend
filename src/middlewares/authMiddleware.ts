import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): any => {
    // Pega o token que vem do Angular no formato "Bearer 123456..."
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica se o token é válido usando a mesma senha secreta do login
        const payload = jwt.verify(token, 'senha-secreta-do-jwt') as { id: number };
        
        // Guarda o ID do usuário na requisição para usarmos depois
        (req as any).userId = payload.id; 
        
        return next(); // Tudo certo, pode passar!
    } catch (error) {
        return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
};