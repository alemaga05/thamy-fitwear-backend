import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { EnderecoController } from './controllers/EnderecoController'; // <-- Importe o novo controller
import { authMiddleware } from './middlewares/authMiddleware'; // <-- Importe o segurança]
import { LojaController } from './controllers/LojaController';
import { ProdutoController } from './controllers/ProdutoController';
import { adminMiddleware } from './middlewares/adminMiddleware';
import { CategoriaController } from './controllers/CategoriaController';
import { PedidoController } from './controllers/PedidoController';
import { BannerController } from "./controllers/BannerController";


const routes = Router();
const userController = new UserController();
const enderecoController = new EnderecoController(); // <-- Instancie o controller de endereço
const lojaController = new LojaController();
const produtoController = new ProdutoController();
const categoriaController = new CategoriaController();
const pedidoController = new PedidoController();
const bannerController = new BannerController();

// Rotas públicas (não precisam de token)
routes.post('/cadastro', userController.create);
routes.post('/login', userController.login);

// Rotas privadas (precisam do authMiddleware para barrar quem não tem token)
routes.get('/perfil', authMiddleware, userController.getProfile);
routes.put('/perfil', authMiddleware, userController.updateProfile); // <-- Nova rota para atualizar telefone e nascimento



// Rotas de endereços — protegidas por autenticação

routes.post(
  '/enderecos',
  authMiddleware,
  enderecoController.create.bind(enderecoController)
);

routes.get(
  '/enderecos',
  authMiddleware,
  enderecoController.getAll.bind(enderecoController)
);

routes.put(
  '/enderecos/:id',
  authMiddleware,
  enderecoController.update.bind(enderecoController)
);

routes.delete(
  '/enderecos/:id',
  authMiddleware,
  enderecoController.delete.bind(enderecoController)
);


// Carrinho e favoritos
routes.post('/favoritos', authMiddleware, lojaController.favoritar);
routes.post('/carrinho', authMiddleware, lojaController.adicionarCarrinho);
routes.get('/favoritos', authMiddleware, lojaController.buscarFavoritos);
routes.get('/carrinho', authMiddleware, lojaController.buscarCarrinho);

routes.delete('/favoritos/:id', authMiddleware, lojaController.removerFavorito);
routes.delete('/carrinho/:id', authMiddleware, lojaController.removerCarrinho);

//PRODUTOS -------------------------------------

// Rotas PÚBLICAS (A vitrine do Front-end precisa ler isso livremente)
routes.get('/produtos', produtoController.getAll);
routes.get('/produtos/:id', produtoController.getById);

// Rotas PROTEGIDAS (Admin)
// Os dois middlewares trabalham em equipe: valida o token -> valida se é admin -> executa
routes.post('/produtos', authMiddleware, adminMiddleware, produtoController.create);
routes.put('/produtos/:id', authMiddleware, adminMiddleware, produtoController.update);
routes.delete('/produtos/:id', authMiddleware, adminMiddleware, produtoController.delete);

// Rotas CATEGORIAS

routes.get(
  '/categorias',
  categoriaController.getAll.bind(categoriaController)
);

routes.get(
  '/categorias/:id',
  categoriaController.getById.bind(categoriaController)
);

routes.post(
  '/categorias',
  authMiddleware,
  adminMiddleware,
  categoriaController.create.bind(categoriaController)
);

routes.put(
  '/categorias/:id',
  authMiddleware,
  adminMiddleware,
  categoriaController.update.bind(categoriaController)
);

routes.delete(
  '/categorias/:id',
  authMiddleware,
  adminMiddleware,
  categoriaController.delete.bind(categoriaController)
);


// Rotas PEDIDOS


routes.post(
  '/pedidos',
  authMiddleware,
  pedidoController.criar.bind(pedidoController)
);

routes.get(
  '/pedidos',
  authMiddleware,
  pedidoController.listarMeusPedidos.bind(pedidoController)
);


routes.put(
  '/admin/pedidos/:id/status',
  authMiddleware,
  adminMiddleware,
  pedidoController.atualizarStatusPedido.bind(pedidoController)
);


// Webhook do Mercado Pago
// NÃO usa authMiddleware, pois a chamada vem do Mercado Pago
routes.post(
  '/webhooks/mercadopago',
  pedidoController.webhookMercadoPago.bind(pedidoController)
);

routes.get(
  '/admin/pedidos',
  authMiddleware,
  adminMiddleware,
  pedidoController.listarTodosPedidos.bind(pedidoController)
);

routes.post(
  '/pedidos/cartao',
  authMiddleware,
  (req, res, next) => {
    console.log('💳 ==========================================');
    console.log('💳 ROTA /pedidos/cartao FOI CHAMADA');
    console.log('💳 ==========================================');
    console.log('Body recebido:', {
      token: req.body?.token ? 'TOKEN_PRESENTE' : 'SEM_TOKEN',
      installments: req.body?.installments,
      paymentMethodId: req.body?.paymentMethodId,
      issuerId: req.body?.issuerId,
      identificationType: req.body?.identificationType,
      identificationNumber: req.body?.identificationNumber
        ? 'CPF_PRESENTE'
        : 'SEM_CPF'
    });

    next();
  },
  pedidoController.criarCartao.bind(pedidoController)
);

// BANNERS DA HOME

// A loja pode consultar somente os banners ativos.
routes.get(
  "/banners",
  bannerController.getPublicos
);

// Somente administrador pode gerenciar banners.
routes.get(
  "/admin/banners",
  authMiddleware,
  adminMiddleware,
  bannerController.getAll
);

routes.post(
  "/admin/banners",
  authMiddleware,
  adminMiddleware,
  bannerController.create
);

routes.put(
  "/admin/banners/:id",
  authMiddleware,
  adminMiddleware,
  bannerController.update
);

routes.delete(
  "/admin/banners/:id",
  authMiddleware,
  adminMiddleware,
  bannerController.delete
);


export default routes;