
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                mensagem: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOneBy({
            id: userId
        });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                mensagem: 'Acesso negado. Apenas administradores.'
            });
        }

        return next();

    } catch (error) {
        console.error('Erro ao validar permissão de administrador:', error);

        return res.status(500).json({
            mensagem: 'Erro interno na validação de admin.'
        });
    }
};
