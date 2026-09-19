import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Endereco } from '../entities/Endereco';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserController {
    async create(req: Request, res: Response): Promise < any > {
        // Pega os dados que o Angular vai enviar no formato JSON
        const { name, email, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            // 1. Verifica se o e-mail já está cadastrado no banco
            const userExists = await userRepository.findOneBy({ email });
            if (userExists) {
                return res.status(400).json({ mensagem: 'Este e-mail já está em uso!' });
            }

            // 2. Criptografa a senha (o número 10 é o "peso" da criptografia, padrão de mercado)
            const hashPassword = await bcrypt.hash(password, 10);

            // 3. Prepara o novo usuário para ser salvo
            const newUser = userRepository.create({
                name,
                email,
                password: hashPassword,
            });

            // 4. Salva no banco de dados PostgreSQL
            await userRepository.save(newUser);

            // 5. Retorna sucesso para o Angular (removendo a senha da resposta por segurança)
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json(userWithoutPassword);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }

    async login(req: Request, res: Response): Promise < any >{
        const { email, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            // 1. Busca o usuário pelo e-mail
            const user = await userRepository.findOneBy({ email });
            if (!user) {
                return res.status(401).json({ mensagem: 'E-mail ou senha incorretos!' });
            }

            // 2. Compara a senha digitada com a criptografada no banco
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ mensagem: 'E-mail ou senha incorretos!' });
            }

            // 3. Gera o Token JWT (a "chave" que mantém o usuário logado)
            // Obs: A senha secreta ('senha-secreta-do-jwt') deve ir para um arquivo .env depois!
            const token = jwt.sign({ id: user.id }, 'senha-secreta-do-jwt', { expiresIn: '1d' });

            // 4. Retorna sucesso removendo a senha dos dados por segurança
            const { password: _, ...userWithoutPassword } = user;
            
            return res.status(200).json({
                user: userWithoutPassword,
                token: token
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }

   async getProfile(req: Request, res: Response): Promise < any > {
        try {
            const userId = (req as any).userId;
            const userRepository = AppDataSource.getRepository(User);
            
            // 2. Adicione o repositório de endereços aqui
            const enderecoRepository = AppDataSource.getRepository(Endereco); 

            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
            }

            // 3. Busca todos os endereços vinculados a este usuário
            const enderecosDoUsuario = await enderecoRepository.find({
                where: { user: { id: userId } }
            });

            const { password, ...userWithoutPassword } = user;
            
            // 4. Retorna os dados do usuário + a lista de endereços
            return res.status(200).json({
                ...userWithoutPassword,
                enderecos: enderecosDoUsuario
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }

    

    async updateProfile(req: Request, res: Response): Promise < any >{
        try {
            // Pega o ID que o nosso middleware (token) liberou
            const userId = (req as any).userId; 
            const { name, telefone, dataNascimento } = req.body;

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
            }

            // Atualiza apenas os campos que vieram na requisição
            user.name = name || user.name;
            user.telefone = telefone || user.telefone;
            user.dataNascimento = dataNascimento || user.dataNascimento;

            // Salva as alterações
            await userRepository.save(user);

            // Remove a senha antes de retornar os dados
            const { password, ...userWithoutPassword } = user;
            
            return res.status(200).json(userWithoutPassword);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro interno ao atualizar perfil.' });
        }
    }
}

