
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Endereco } from '../entities/Endereco';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserController {

    async create(req: Request, res: Response): Promise<any> {
        const { name, email, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            const userExists = await userRepository.findOneBy({ email });

            if (userExists) {
                return res.status(400).json({
                    mensagem: 'Este e-mail já está em uso!'
                });
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const newUser = userRepository.create({
                name,
                email,
                password: hashPassword,
            });

            await userRepository.save(newUser);

            const { password: _, ...userWithoutPassword } = newUser;

            return res.status(201).json(userWithoutPassword);

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);

            return res.status(500).json({
                mensagem: 'Erro interno no servidor.'
            });
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        const { email, password } = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOneBy({ email });

            if (!user) {
                return res.status(401).json({
                    mensagem: 'E-mail ou senha incorretos!'
                });
            }

            const isValidPassword = await bcrypt.compare(
                password,
                user.password
            );

            if (!isValidPassword) {
                return res.status(401).json({
                    mensagem: 'E-mail ou senha incorretos!'
                });
            }

            const jwtSecret = process.env.JWT_SECRET;

            if (!jwtSecret) {
                console.error('JWT_SECRET não configurado no ambiente.');

                return res.status(500).json({
                    mensagem: 'Erro interno de configuração do servidor.'
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                jwtSecret,
                {
                    expiresIn: '1d'
                }
            );

            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Erro ao realizar login:', error);

            return res.status(500).json({
                mensagem: 'Erro interno no servidor.'
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;

            const userRepository = AppDataSource.getRepository(User);
            const enderecoRepository = AppDataSource.getRepository(Endereco);

            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({
                    mensagem: 'Usuário não encontrado.'
                });
            }

            const enderecosDoUsuario = await enderecoRepository.find({
                where: {
                    user: { id: userId }
                }
            });

            const { password, ...userWithoutPassword } = user;

            return res.status(200).json({
                ...userWithoutPassword,
                enderecos: enderecosDoUsuario
            });

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);

            return res.status(500).json({
                mensagem: 'Erro interno no servidor.'
            });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;

            const { name, telefone, dataNascimento } = req.body;

            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({
                    mensagem: 'Usuário não encontrado.'
                });
            }

            user.name = name || user.name;
            user.telefone = telefone || user.telefone;
            user.dataNascimento = dataNascimento || user.dataNascimento;

            await userRepository.save(user);

            const { password, ...userWithoutPassword } = user;

            return res.status(200).json(userWithoutPassword);

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);

            return res.status(500).json({
                mensagem: 'Erro interno ao atualizar perfil.'
            });
        }
    }
}
