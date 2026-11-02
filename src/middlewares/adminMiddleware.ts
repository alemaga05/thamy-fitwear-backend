import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = (req as any).user?.id;
        
        console.log('--- ADMIN MIDDLEWARE ATIVADO ---');
        console.log('ID do usuário extraído do token:', userId);

        if (!userId) {
            console.log('BLOQUEADO: ID do usuário não encontrado no token.');
            return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });

        console.log('Usuário encontrado no banco:', user?.email, '| Role:', user?.role);

        if (!user || user.role !== 'admin') {
            console.log('BLOQUEADO: O usuário não tem perfil de admin.');
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores.' });
        }

        console.log('AUTORIZADO: Acesso admin concedido com sucesso.');
        return next();

    } catch (error) {
        console.error('Erro no adminMiddleware:', error);
        return res.status(500).json({ mensagem: 'Erro interno na validação de admin.' });
    }
};