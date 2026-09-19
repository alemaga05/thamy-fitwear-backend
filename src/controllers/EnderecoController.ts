import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Endereco } from '../entities/Endereco';

export class EnderecoController {
    
    async create(req: Request, res: Response): Promise < any >{
        // Recebe os dados do endereço
        const { rua, bairro, cidade, pais, principal } = req.body;
        // Pega o ID do usuário através do Token JWT (middleware)
        const userId = (req as any).userId; 

        try {
            const userRepository = AppDataSource.getRepository(User);
            const enderecoRepository = AppDataSource.getRepository(Endereco);

            // Verifica se o usuário existe
            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
            }

            // Cria o novo endereço vinculado ao usuário
            const novoEndereco = enderecoRepository.create({
                rua,
                bairro,
                cidade,
                pais: pais || 'Brasil',
                principal: principal || false,
                user: user
            });

            // Salva no banco de dados
            await enderecoRepository.save(novoEndereco);

            // Retorna o endereço criado para o Angular (sem expor os dados completos do user)
            return res.status(201).json({
                id: novoEndereco.id,
                rua: novoEndereco.rua,
                bairro: novoEndereco.bairro,
                cidade: novoEndereco.cidade,
                pais: novoEndereco.pais,
                principal: novoEndereco.principal
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno ao salvar endereço.' });
        }
    }

    // ... (imports e método create continuam iguais lá em cima) ...

    async update(req: Request, res: Response): Promise < any > {
        const { id } = req.params; // Pega o ID da URL
        const { rua, bairro, cidade, pais, principal } = req.body;
        const userId = (req as any).userId;

        try {
            const enderecoRepository = AppDataSource.getRepository(Endereco);
            
            // Busca o endereço garantindo que ele pertence ao usuário logado
            const endereco = await enderecoRepository.findOne({ 
                where: { id: Number(id), user: { id: userId } } 
            });

            if (!endereco) {
                return res.status(404).json({ mensagem: 'Endereço não encontrado ou não pertence a você.' });
            }

            // Atualiza os dados
            endereco.rua = rua || endereco.rua;
            endereco.bairro = bairro || endereco.bairro;
            endereco.cidade = cidade || endereco.cidade;
            endereco.pais = pais || endereco.pais;
            if (principal !== undefined) endereco.principal = principal;

            await enderecoRepository.save(endereco);
            return res.status(200).json(endereco);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno ao atualizar endereço.' });
        }
    }

    async delete(req: Request, res: Response): Promise < any > {
        const { id } = req.params;
        const userId = (req as any).userId;

        try {
            const enderecoRepository = AppDataSource.getRepository(Endereco);
            
            const endereco = await enderecoRepository.findOne({ 
                where: { id: Number(id), user: { id: userId } } 
            });

            if (!endereco) {
                return res.status(404).json({ mensagem: 'Endereço não encontrado.' });
            }

            await enderecoRepository.remove(endereco);
            return res.status(200).json({ mensagem: 'Endereço removido com sucesso.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno ao deletar endereço.' });
        }
    }
}
