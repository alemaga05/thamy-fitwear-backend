import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { EnderecoController } from './controllers/EnderecoController'; // <-- Importe o novo controller
import { authMiddleware } from './middlewares/authMiddleware'; // <-- Importe o segurança]
import { LojaController } from './controllers/LojaController';

const routes = Router();
const userController = new UserController();
const enderecoController = new EnderecoController(); // <-- Instancie o controller de endereço
const lojaController = new LojaController();

// Rotas públicas (não precisam de token)
routes.post('/cadastro', userController.create);
routes.post('/login', userController.login);

// Rotas privadas (precisam do authMiddleware para barrar quem não tem token)
routes.get('/perfil', authMiddleware, userController.getProfile);
routes.put('/perfil', authMiddleware, userController.updateProfile); // <-- Nova rota para atualizar telefone e nascimento
routes.post('/enderecos', authMiddleware, enderecoController.create); 
routes.put('/enderecos/:id', authMiddleware, enderecoController.update);
routes.delete('/enderecos/:id', authMiddleware, enderecoController.delete);

// Carrinho e favoritos
routes.post('/favoritos', authMiddleware, lojaController.favoritar);
routes.post('/carrinho', authMiddleware, lojaController.adicionarCarrinho);
routes.get('/favoritos', authMiddleware, lojaController.buscarFavoritos);
routes.get('/carrinho', authMiddleware, lojaController.buscarCarrinho);

routes.delete('/favoritos/:id', authMiddleware, lojaController.removerFavorito);
routes.delete('/carrinho/:id', authMiddleware, lojaController.removerCarrinho);

export default routes;