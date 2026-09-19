import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Favorito } from '../entities/Favorito';
import { Carrinho } from '../entities/Carrinho';

export class LojaController {
    
    // ================= FAVORITOS =================
    async favoritar(req: Request, res: Response): Promise  < any >{
        const { produtoId } = req.body;
        const userId = (req as any).userId;

        try {
            const favoritoRepo = AppDataSource.getRepository(Favorito);
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });

            if (!user) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

            // Verifica se já favoritou para não duplicar
            const jaFavoritou = await favoritoRepo.findOne({ where: { produtoId, user: { id: userId } } });
            
            if (jaFavoritou) {
                // Se clicar de novo, desfavorita (remove)
                await favoritoRepo.remove(jaFavoritou);
                return res.status(200).json({ mensagem: 'Removido dos favoritos' });
            }

            // Cria o favorito
            const novoFavorito = favoritoRepo.create({ produtoId, user });
            await favoritoRepo.save(novoFavorito);
            return res.status(201).json({ mensagem: 'Adicionado aos favoritos' });

        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao favoritar.' });
        }
    }

    // ================= BUSCAR FAVORITOS =================
    async buscarFavoritos(req: Request, res: Response): Promise  < any >{
        const userId = (req as any).userId;
        try {
            const favoritoRepo = AppDataSource.getRepository(Favorito);
            // Busca todos os favoritos do usuário logado
            const itens = await favoritoRepo.find({ where: { user: { id: userId } } });
            return res.status(200).json(itens);
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao buscar favoritos.' });
        }
    }

    // ================= REMOVER DOS FAVORITOS =================
    async removerFavorito(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const userId = (req as any).userId;

        try {
            const favoritoRepo = AppDataSource.getRepository(Favorito);
            const favorito = await favoritoRepo.findOne({ where: { id: Number(id), user: { id: userId } } });

            if (!favorito) return res.status(404).json({ mensagem: 'Favorito não encontrado' });

            await favoritoRepo.remove(favorito);
            return res.status(200).json({ mensagem: 'Removido dos favoritos permanentemente' });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao remover favorito.' });
        }
    }

    // ================= CARRINHO =================
    async adicionarCarrinho(req: Request, res: Response): Promise  < any >{
        const { produtoId, tamanho, quantidade } = req.body;
        const userId = (req as any).userId;

        try {
            const carrinhoRepo = AppDataSource.getRepository(Carrinho);
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });

            if (!user) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

            // Verifica se esse produto NESSE tamanho já está no carrinho
            const itemExistente = await carrinhoRepo.findOne({ 
                where: { produtoId, tamanho, user: { id: userId } } 
            });

            if (itemExistente) {
                // Se já existir, só soma a quantidade
                itemExistente.quantidade += quantidade;
                await carrinhoRepo.save(itemExistente);
                return res.status(200).json(itemExistente);
            }

            // Se não existir, cria um novo
            const novoItem = carrinhoRepo.create({ produtoId, tamanho, quantidade, user });
            await carrinhoRepo.save(novoItem);
            return res.status(201).json(novoItem);

        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao adicionar ao carrinho.' });
        }
    }

    
    // ================= BUSCAR CARRINHO =================
    async buscarCarrinho(req: Request, res: Response): Promise  < any >{
        const userId = (req as any).userId;
        try {
            const carrinhoRepo = AppDataSource.getRepository(Carrinho);
            // Busca o carrinho do usuário logado
            const itens = await carrinhoRepo.find({ where: { user: { id: userId } } });
            return res.status(200).json(itens);
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao buscar carrinho.' });
        }
    }

    async removerCarrinho(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const userId = (req as any).userId;

        try {
            const carrinhoRepo = AppDataSource.getRepository(Carrinho);
            const item = await carrinhoRepo.findOne({ where: { id: Number(id), user: { id: userId } } });

            if (!item) return res.status(404).json({ mensagem: 'Item não encontrado' });

            await carrinhoRepo.remove(item);
            return res.status(200).json({ mensagem: 'Removido do carrinho permanentemente' });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao remover do carrinho.' });
        }
    }


    

}