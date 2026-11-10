import { Request, Response } from 'express';

import { AppDataSource } from '../data-source';

import { Pedido } from '../entities/Pedido';
import { PedidoItem } from '../entities/PedidoItem';
import { Carrinho } from '../entities/Carrinho';
import { Produto } from '../entities/Produto';
import { User } from '../entities/User';
import { Endereco } from '../entities/Endereco';

import mercadoPagoService from '../services/MercadoPagoService';


export class PedidoController {

  // =========================================================
  // REPOSITORIES
  // =========================================================

  private pedidoRepository =
    AppDataSource.getRepository(Pedido);

  private pedidoItemRepository =
    AppDataSource.getRepository(PedidoItem); 

  private carrinhoRepository =
    AppDataSource.getRepository(Carrinho);

  private produtoRepository =
    AppDataSource.getRepository(Produto);

  private userRepository =
    AppDataSource.getRepository(User);

  private enderecoRepository =
    AppDataSource.getRepository(Endereco);


  // =========================================================
  // CRIAR PEDIDO - PIX
  // =========================================================

  async criar(req: Request, res: Response) {

    try {

      const userId =
        (req as any).user?.id;

      if (!userId) {

        return res.status(401).json({
          mensagem: 'Usuário não autenticado.'
        });

      }


      // -----------------------------------------------------
      // USUÁRIO
      // -----------------------------------------------------

      const usuario =
        await this.userRepository.findOne({
          where: {
            id: Number(userId)
          }
        });


      if (!usuario) {

        return res.status(404).json({
          mensagem: 'Usuário não encontrado.'
        });

      }


      // -----------------------------------------------------
      // ENDEREÇO PRINCIPAL
      // -----------------------------------------------------

      const endereco =
        await this.enderecoRepository.findOne({

          where: {

            user: {
              id: Number(userId)
            },

            principal: true

          },

          relations: {
            user: true
          }

        });


      if (!endereco) {

        return res.status(400).json({

          mensagem:
            'Você precisa cadastrar um endereço principal antes de finalizar a compra.'

        });

      }


      // -----------------------------------------------------
      // CARRINHO
      // -----------------------------------------------------

      const itensCarrinho =
        await this.carrinhoRepository.find({

          where: {

            user: {
              id: Number(userId)
            }

          },

          relations: {
            user: true
          }

        });


      if (!itensCarrinho.length) {

        return res.status(400).json({

          mensagem:
            'Seu carrinho está vazio.'

        });

      }


      // -----------------------------------------------------
      // VALORES
      // -----------------------------------------------------

      let valorSubtotal = 0;

      const itensParaPedido: PedidoItem[] = [];


      // -----------------------------------------------------
      // PRODUTOS
      // -----------------------------------------------------

      for (const itemCarrinho of itensCarrinho) {

        const produto =
          await this.produtoRepository.findOne({

            where: {
              id: itemCarrinho.produtoId
            }

          });


        if (!produto) {

          return res.status(400).json({

            mensagem:
              `O produto ${itemCarrinho.produtoId} não está mais disponível.`

          });

        }


        // ---------------------------------------------------
        // ESTOQUE
        // ---------------------------------------------------

        if (
          Number(produto.estoque) <
          Number(itemCarrinho.quantidade)
        ) {

          return res.status(400).json({

            mensagem:
              `Estoque insuficiente para o produto "${produto.nome}".`

          });

        }


        // ---------------------------------------------------
        // PREÇO
        // ---------------------------------------------------

        const preco =
          Number(produto.preco);

        const quantidade =
          Number(itemCarrinho.quantidade);

        const subtotal =
          preco * quantidade;


        valorSubtotal +=
          subtotal;


        // ---------------------------------------------------
        // ITEM DO PEDIDO
        // ---------------------------------------------------

        const itemPedido =
          new PedidoItem();

        itemPedido.produtoId =
          produto.id;

        itemPedido.nomeProduto =
          produto.nome;

        itemPedido.precoUnitario =
          preco;

        itemPedido.quantidade =
          quantidade;

        itemPedido.tamanho =
          itemCarrinho.tamanho || null;

        itemPedido.subtotal =
          subtotal;

        itemPedido.imagemUrl =
          produto.imagemUrl || null;


        itensParaPedido.push(
          itemPedido
        );

      }


      // -----------------------------------------------------
      // FRETE
      // -----------------------------------------------------

      const valorFrete =
        0;


      const valorTotal =
        valorSubtotal +
        valorFrete;


      // -----------------------------------------------------
      // NÚMERO DO PEDIDO
      // -----------------------------------------------------

      const numeroPedido =
        `TH-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;


      // -----------------------------------------------------
      // CRIA PEDIDO
      // -----------------------------------------------------

      const pedido =
        new Pedido();

      pedido.user =
        usuario;

      pedido.numeroPedido =
        numeroPedido;

      pedido.nomeCliente =
        usuario.name;

      pedido.emailCliente =
        usuario.email;

      pedido.telefoneCliente =
        usuario.telefone || null;

      pedido.ruaEntrega =
        endereco.rua;

      pedido.bairroEntrega =
        endereco.bairro;

      pedido.cidadeEntrega =
        endereco.cidade;

      pedido.paisEntrega =
        endereco.pais || 'Brasil';

      pedido.valorSubtotal =
        valorSubtotal;

      pedido.valorFrete =
        valorFrete;

      pedido.valorTotal =
        valorTotal;

      pedido.statusPagamento =
        'PENDENTE';

      pedido.metodoPagamento =
        'pix';

      pedido.gateway =
        'mercadopago';

      pedido.gatewayOrderId =
        null;

      pedido.gatewayPaymentId =
        null;

      pedido.statusPedido =
        'AGUARDANDO_PAGAMENTO';


      // -----------------------------------------------------
      // SALVA PEDIDO
      // -----------------------------------------------------

      const pedidoSalvo =
        await this.pedidoRepository.save(
          pedido
        );


      // -----------------------------------------------------
      // ITENS
      // -----------------------------------------------------

      for (const item of itensParaPedido) {

        item.pedido =
          pedidoSalvo;

      }


      await this.pedidoItemRepository.save(
        itensParaPedido
      );


      // -----------------------------------------------------
      // MERCADO PAGO - PIX
      // -----------------------------------------------------

      try {

        const order =
          await mercadoPagoService.criarPix({

            valor:
              valorTotal,

            descricao:
              `Pedido ${pedidoSalvo.numeroPedido} - Thamy Fitwear`,

            email:
              usuario.email,

            externalReference:
              pedidoSalvo.numeroPedido

          });


        pedidoSalvo.gateway =
          'mercadopago';

        pedidoSalvo.gatewayOrderId =
          order.id
            ? String(order.id)
            : null;


        const pagamento =
          order.transactions
            ?.payments?.[0];


        pedidoSalvo.gatewayPaymentId =
          pagamento?.id
            ? String(pagamento.id)
            : null;


        await this.pedidoRepository.save(
          pedidoSalvo
        );


        return res.status(201).json({

          mensagem:
            'Pedido criado com sucesso.',

          pedido: {

            id:
              pedidoSalvo.id,

            numeroPedido:
              pedidoSalvo.numeroPedido,

            valorSubtotal:
              pedidoSalvo.valorSubtotal,

            valorFrete:
              pedidoSalvo.valorFrete,

            valorTotal:
              pedidoSalvo.valorTotal,

            statusPagamento:
              pedidoSalvo.statusPagamento,

            statusPedido:
              pedidoSalvo.statusPedido,

            metodoPagamento:
              pedidoSalvo.metodoPagamento,

            gatewayOrderId:
              pedidoSalvo.gatewayOrderId,

            gatewayPaymentId:
              pedidoSalvo.gatewayPaymentId

          },

          mercadoPago: {

            orderId:
              order.id,

            status:
              order.status,

            statusDetail:
              order.status_detail,

            transactions:
              order.transactions

          }

        });


      } catch (mercadoPagoError) {

        console.error(
          '❌ Erro ao criar PIX no Mercado Pago:',
          mercadoPagoError
        );


        pedidoSalvo.statusPagamento =
          'RECUSADO';

        pedidoSalvo.statusPedido =
          'AGUARDANDO_PAGAMENTO';


        await this.pedidoRepository.save(
          pedidoSalvo
        );


        return res.status(502).json({

          mensagem:
            'Não foi possível criar o pagamento PIX.',

          pedidoId:
            pedidoSalvo.id,

          numeroPedido:
            pedidoSalvo.numeroPedido

        });

      }


    } catch (error) {

      console.error(
        '❌ Erro ao criar pedido:',
        error
      );


      return res.status(500).json({

        mensagem:
          'Erro interno ao criar pedido.'

      });

    }

  }


  // =========================================================
  // CRIAR PEDIDO COM CARTÃO
  // =========================================================

  async criarCartao(req: Request, res: Response) {

    try {

      const userId =
        (req as any).user?.id;


      if (!userId) {

        return res.status(401).json({

          mensagem:
            'Usuário não autenticado.'

        });

      }


      // -----------------------------------------------------
      // DADOS RECEBIDOS DO FRONTEND
      // -----------------------------------------------------

      const {

        token,

        installments,

        paymentMethodId,

        identificationType,

        identificationNumber,

        email

      } = req.body;


      console.log('==========================================');
      console.log('💳 PEDIDO COM CARTÃO');
      console.log('==========================================');

      console.log(
        'Token:',
        token ? 'TOKEN_PRESENTE' : 'TOKEN_AUSENTE'
      );

      console.log(
        'Parcelas:',
        installments
      );

      console.log(
        'Payment Method:',
        paymentMethodId
      );

      console.log(
        'Identification Type:',
        identificationType
      );

      console.log(
        'Identification Number:',
        identificationNumber
          ? 'CPF_PRESENTE'
          : 'CPF_AUSENTE'
      );

      console.log(
        'E-mail recebido:',
        email || 'NÃO INFORMADO'
      );

      console.log('==========================================');


      // -----------------------------------------------------
      // VALIDAÇÕES
      // -----------------------------------------------------

      if (!token) {

        return res.status(400).json({

          mensagem:
            'Token do cartão não informado.'

        });

      }


      if (!paymentMethodId) {

        return res.status(400).json({

          mensagem:
            'Método de pagamento não informado.'

        });

      }


      if (
        !installments ||
        Number(installments) < 1
      ) {

        return res.status(400).json({

          mensagem:
            'Número de parcelas inválido.'

        });

      }


      if (!identificationType) {

        return res.status(400).json({

          mensagem:
            'Tipo de documento não informado.'

        });

      }


      if (!identificationNumber) {

        return res.status(400).json({

          mensagem:
            'Número do documento não informado.'

        });

      }


      // -----------------------------------------------------
      // USUÁRIO
      // -----------------------------------------------------

      const usuario =
        await this.userRepository.findOne({

          where: {
            id: Number(userId)
          }

        });


      if (!usuario) {

        return res.status(404).json({

          mensagem:
            'Usuário não encontrado.'

        });

      }


      // -----------------------------------------------------
      // E-MAIL DO PAGAMENTO
      // -----------------------------------------------------

      const emailPagamento =
        email?.trim() ||
        usuario.email;


      // -----------------------------------------------------
      // ENDEREÇO
      // -----------------------------------------------------

      const endereco =
        await this.enderecoRepository.findOne({

          where: {

            user: {
              id: Number(userId)
            },

            principal: true

          },

          relations: {
            user: true
          }

        });


      if (!endereco) {

        return res.status(400).json({

          mensagem:
            'Você precisa cadastrar um endereço principal antes de finalizar a compra.'

        });

      }


      // -----------------------------------------------------
      // CARRINHO
      // -----------------------------------------------------

      const itensCarrinho =
        await this.carrinhoRepository.find({

          where: {

            user: {
              id: Number(userId)
            }

          },

          relations: {
            user: true
          }

        });


      if (!itensCarrinho.length) {

        return res.status(400).json({

          mensagem:
            'Seu carrinho está vazio.'

        });

      }


      // -----------------------------------------------------
      // VALORES
      // -----------------------------------------------------

      let valorSubtotal = 0;

      const itensParaPedido: PedidoItem[] = [];


      // -----------------------------------------------------
      // PRODUTOS
      // -----------------------------------------------------

      for (const itemCarrinho of itensCarrinho) {

        const produto =
          await this.produtoRepository.findOne({

            where: {

              id:
                itemCarrinho.produtoId

            }

          });


        if (!produto) {

          return res.status(400).json({

            mensagem:
              `O produto ${itemCarrinho.produtoId} não está mais disponível.`

          });

        }


        // ---------------------------------------------------
        // ESTOQUE
        // ---------------------------------------------------

        if (
          Number(produto.estoque) <
          Number(itemCarrinho.quantidade)
        ) {

          return res.status(400).json({

            mensagem:
              `Estoque insuficiente para o produto "${produto.nome}".`

          });

        }


        // ---------------------------------------------------
        // PREÇO
        // ---------------------------------------------------

        const preco =
          Number(produto.preco);

        const quantidade =
          Number(itemCarrinho.quantidade);

        const subtotal =
          preco * quantidade;


        valorSubtotal +=
          subtotal;


        // ---------------------------------------------------
        // SNAPSHOT
        // ---------------------------------------------------

        const itemPedido =
          new PedidoItem();

        itemPedido.produtoId =
          produto.id;

        itemPedido.nomeProduto =
          produto.nome;

        itemPedido.precoUnitario =
          preco;

        itemPedido.quantidade =
          quantidade;

        itemPedido.tamanho =
          itemCarrinho.tamanho || null;

        itemPedido.subtotal =
          subtotal;

        itemPedido.imagemUrl =
          produto.imagemUrl || null;


        itensParaPedido.push(
          itemPedido
        );

      }


      // -----------------------------------------------------
      // FRETE
      // -----------------------------------------------------

      const valorFrete =
        0;


      const valorTotal =
        valorSubtotal +
        valorFrete;


      // -----------------------------------------------------
      // NÚMERO DO PEDIDO
      // -----------------------------------------------------

      const numeroPedido =
        `TH-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;


      // -----------------------------------------------------
      // CRIA PEDIDO
      // -----------------------------------------------------

      const pedido =
        new Pedido();

      pedido.user =
        usuario;

      pedido.numeroPedido =
        numeroPedido;

      pedido.nomeCliente =
        usuario.name;

      pedido.emailCliente =
        emailPagamento;

      pedido.telefoneCliente =
        usuario.telefone || null;

      pedido.ruaEntrega =
        endereco.rua;

      pedido.bairroEntrega =
        endereco.bairro;

      pedido.cidadeEntrega =
        endereco.cidade;

      pedido.paisEntrega =
        endereco.pais || 'Brasil';

      pedido.valorSubtotal =
        valorSubtotal;

      pedido.valorFrete =
        valorFrete;

      pedido.valorTotal =
        valorTotal;

      pedido.statusPagamento =
        'PENDENTE';

      pedido.metodoPagamento =
        'cartao';

      pedido.gateway =
        'mercadopago';

      pedido.gatewayOrderId =
        null;

      pedido.gatewayPaymentId =
        null;

      pedido.statusPedido =
        'AGUARDANDO_PAGAMENTO';


      // -----------------------------------------------------
      // SALVA
      // -----------------------------------------------------

      const pedidoSalvo =
        await this.pedidoRepository.save(
          pedido
        );


      // -----------------------------------------------------
      // ITENS
      // -----------------------------------------------------

      for (const item of itensParaPedido) {

        item.pedido =
          pedidoSalvo;

      }


      await this.pedidoItemRepository.save(
        itensParaPedido
      );


      // -----------------------------------------------------
      // MERCADO PAGO
      // -----------------------------------------------------

      try {

        const order =
          await mercadoPagoService.criarPagamentoCartao({

            valor:
              valorTotal,

            descricao:
              `Pedido ${pedidoSalvo.numeroPedido} - Thamy Fitwear`,

            token:
              token,

            installments:
              Number(installments),

            paymentMethodId:
              paymentMethodId,

            email:
              emailPagamento,

            identificationType:
              identificationType,

            identificationNumber:
              identificationNumber,

            externalReference:
              pedidoSalvo.numeroPedido

          });


        // ---------------------------------------------------
        // PAYMENT
        // ---------------------------------------------------

        const pagamento =
          order.transactions
            ?.payments?.[0];


        // ---------------------------------------------------
        // IDS MERCADO PAGO
        // ---------------------------------------------------

        pedidoSalvo.gateway =
          'mercadopago';

        pedidoSalvo.gatewayOrderId =
          order.id
            ? String(order.id)
            : null;

        pedidoSalvo.gatewayPaymentId =
          pagamento?.id
            ? String(pagamento.id)
            : null;


        // ---------------------------------------------------
        // STATUS
        // ---------------------------------------------------

        const statusPagamentoMP =
          pagamento?.status;

        const statusOrderMP =
          order.status;

        const statusDetailMP =
          pagamento?.status_detail ||
          order.status_detail;


        // ---------------------------------------------------
        // APROVADO
        // ---------------------------------------------------

        if (

          statusPagamentoMP ===
            'approved'

          ||

          (
            statusOrderMP ===
              'processed'

            &&

            statusDetailMP ===
              'accredited'
          )

        ) {

          pedidoSalvo.statusPagamento =
            'APROVADO';

          pedidoSalvo.statusPedido =
            'PAGAMENTO_APROVADO';

        }


        // ---------------------------------------------------
        // RECUSADO
        // ---------------------------------------------------

        else if (

          statusPagamentoMP ===
            'rejected'

          ||

          statusOrderMP ===
            'failed'

        ) {

          pedidoSalvo.statusPagamento =
            'RECUSADO';

          pedidoSalvo.statusPedido =
            'AGUARDANDO_PAGAMENTO';

        }


        // ---------------------------------------------------
        // PENDENTE
        // ---------------------------------------------------

        else {

          pedidoSalvo.statusPagamento =
            'PENDENTE';

          pedidoSalvo.statusPedido =
            'AGUARDANDO_PAGAMENTO';

        }


        await this.pedidoRepository.save(
          pedidoSalvo
        );


        // ---------------------------------------------------
        // RESPOSTA
        // ---------------------------------------------------

        return res.status(201).json({

          mensagem:
            'Pedido com cartão processado.',

          pedido: {

            id:
              pedidoSalvo.id,

            numeroPedido:
              pedidoSalvo.numeroPedido,

            valorSubtotal:
              pedidoSalvo.valorSubtotal,

            valorFrete:
              pedidoSalvo.valorFrete,

            valorTotal:
              pedidoSalvo.valorTotal,

            statusPagamento:
              pedidoSalvo.statusPagamento,

            statusPedido:
              pedidoSalvo.statusPedido,

            metodoPagamento:
              pedidoSalvo.metodoPagamento,

            gatewayOrderId:
              pedidoSalvo.gatewayOrderId,

            gatewayPaymentId:
              pedidoSalvo.gatewayPaymentId

          },

          mercadoPago: {

            orderId:
              order.id,

            status:
              order.status,

            statusDetail:
              order.status_detail,

            paymentId:
              pagamento?.id,

            paymentStatus:
              pagamento?.status,

            paymentStatusDetail:
              pagamento?.status_detail

          }

        });


      } catch (mercadoPagoError) {

        console.error('==========================================');
        console.error('❌ ERRO AO PROCESSAR CARTÃO');
        console.error('==========================================');

        console.error(
          mercadoPagoError
        );

        console.error('==========================================');


        pedidoSalvo.statusPagamento =
          'RECUSADO';

        pedidoSalvo.statusPedido =
          'AGUARDANDO_PAGAMENTO';


        await this.pedidoRepository.save(
          pedidoSalvo
        );


        return res.status(502).json({

          mensagem:
            'Não foi possível processar o pagamento com cartão.',

          pedidoId:
            pedidoSalvo.id,

          numeroPedido:
            pedidoSalvo.numeroPedido

        });

      }


    } catch (error) {

      console.error(
        '❌ Erro interno ao criar pedido com cartão:',
        error
      );


      return res.status(500).json({

        mensagem:
          'Erro interno ao processar pedido com cartão.'

      });

    }

  }


 
// =========================================================
// LISTAR PEDIDOS DO USUÁRIO LOGADO
// GET /pedidos
// =========================================================

async listarMeusPedidos(req: Request, res: Response) {
  try {
    const userId = Number((req as any).user?.id);

    if (!userId || !Number.isFinite(userId)) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.'
      });
    }

    const pedidos = await this.pedidoRepository.find({
      where: {
        user: { id: userId }
      },
      relations: {
        itens: true
      },
      order: {
        criadoEm: 'DESC'
      }
    });

    const resposta = pedidos.map((pedido) => ({
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      status: pedido.statusPedido,
      statusPedido: pedido.statusPedido,
      statusPagamento: pedido.statusPagamento,
      total: Number(pedido.valorTotal),
      subtotal: Number(pedido.valorSubtotal),
      frete: Number(pedido.valorFrete),
      data: pedido.criadoEm,
      criadoEm: pedido.criadoEm,
      metodoPagamento: pedido.metodoPagamento,

      itens: (pedido.itens || []).map((item) => ({
        id: item.id,
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        imagemUrl: item.imagemUrl || null,
        precoUnitario: Number(item.precoUnitario),
        quantidade: Number(item.quantidade),
        tamanho: item.tamanho || null,
        subtotal: Number(item.subtotal)
      }))
    }));

    return res.status(200).json(resposta);

  } catch (error) {
    console.error('Erro ao listar pedidos do usuário:', error);

    return res.status(500).json({
      mensagem: 'Erro ao buscar seus pedidos.'
    });
  }
}


// =========================================================
// LISTAR TODOS OS PEDIDOS
// GET /admin/pedidos
// =========================================================

async listarTodosPedidos(req: Request, res: Response) {
  try {
    const pedidos = await this.pedidoRepository.find({
      relations: {
        user: true,
        itens: true
      },
      order: {
        criadoEm: 'DESC'
      }
    });

    const resposta = pedidos.map((pedido) => ({
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,

      cliente: {
        nome: pedido.nomeCliente || pedido.user?.name || '',
        email: pedido.emailCliente || pedido.user?.email || '',
        telefone: pedido.telefoneCliente || null
      },

      endereco: {
        rua: pedido.ruaEntrega || '',
        bairro: pedido.bairroEntrega || '',
        cidade: pedido.cidadeEntrega || '',
        pais: pedido.paisEntrega || 'Brasil'
      },

      subtotal: Number(pedido.valorSubtotal),
      frete: Number(pedido.valorFrete),
      total: Number(pedido.valorTotal),

      metodoPagamento: pedido.metodoPagamento || null,
      gateway: pedido.gateway || null,

      statusPagamento: pedido.statusPagamento,
      statusPedido: pedido.statusPedido,

      criadoEm: pedido.criadoEm,
      atualizadoEm: pedido.atualizadoEm,

      itens: (pedido.itens || []).map((item) => ({
        id: item.id,
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        precoUnitario: Number(item.precoUnitario),
        quantidade: Number(item.quantidade),
        tamanho: item.tamanho || null,
        subtotal: Number(item.subtotal),
        imagemUrl: item.imagemUrl || null
      }))
    }));

    return res.status(200).json(resposta);

  } catch (error) {
    console.error('Erro ao listar todos os pedidos:', error);

    return res.status(500).json({
      mensagem: 'Erro interno ao buscar os pedidos.'
    });
  }
}




// =========================================================
// ATUALIZAR STATUS DO PEDIDO
// =========================================================

async atualizarStatusPedido(
  req: Request,
  res: Response
) {

  try {

    // -----------------------------------------------------
    // ID DO PEDIDO
    // -----------------------------------------------------

    const pedidoId =
      Number(req.params.id);


    if (!pedidoId || Number.isNaN(pedidoId)) {

      return res.status(400).json({

        mensagem:
          'ID do pedido inválido.'

      });

    }


    // -----------------------------------------------------
    // STATUS RECEBIDO
    // -----------------------------------------------------

    const {
      statusPedido
    } = req.body;


    if (!statusPedido) {

      return res.status(400).json({

        mensagem:
          'O status do pedido não foi informado.'

      });

    }


    // -----------------------------------------------------
    // STATUS PERMITIDOS
    // -----------------------------------------------------

    const statusPermitidos = [

      'AGUARDANDO_PAGAMENTO',

      'PAGAMENTO_APROVADO',

      'EM_PREPARACAO',

      'ENVIADO',

      'ENTREGUE',

      'CANCELADO'

    ];


    if (
      !statusPermitidos.includes(
        statusPedido
      )
    ) {

      return res.status(400).json({

        mensagem:
          'Status do pedido inválido.',

        statusPermitidos

      });

    }


    // -----------------------------------------------------
    // BUSCA PEDIDO
    // -----------------------------------------------------

    const pedido =
      await this.pedidoRepository.findOne({

        where: {

          id:
            pedidoId

        },

        relations: {

          user: true,

          itens: true

        }

      });


    if (!pedido) {

      return res.status(404).json({

        mensagem:
          'Pedido não encontrado.'

      });

    }


    // -----------------------------------------------------
    // ATUALIZA STATUS
    // -----------------------------------------------------

    pedido.statusPedido =
      statusPedido;


    // -----------------------------------------------------
    // SALVA
    // -----------------------------------------------------

    const pedidoAtualizado =
      await this.pedidoRepository.save(
        pedido
      );


    // -----------------------------------------------------
    // RESPOSTA
    // -----------------------------------------------------

    return res.status(200).json({

      mensagem:
        'Status do pedido atualizado com sucesso.',

      pedido:
        pedidoAtualizado

    });


  } catch (error) {

    console.error(
      '❌ Erro ao atualizar status do pedido:',
      error
    );


    return res.status(500).json({

      mensagem:
        'Erro interno ao atualizar status do pedido.'

    });

  }

}



  // =========================================================
  // WEBHOOK MERCADO PAGO
  // =========================================================

  async webhookMercadoPago(
    req: Request,
    res: Response
  ) {

    try {

      console.log('==========================================');
      console.log('🔔 WEBHOOK MERCADO PAGO');
      console.log('==========================================');

      console.log(
        'Body recebido:',
        JSON.stringify(
          req.body,
          null,
          2
        )
      );


      // -----------------------------------------------------
      // TIPO
      // -----------------------------------------------------

      const type =
        req.body?.type ||
        req.body?.action;


      // -----------------------------------------------------
      // ORDER ID
      // -----------------------------------------------------

      const orderId =
        req.body?.data?.id;


      console.log(
        'Tipo:',
        type
      );

      console.log(
        'Order ID:',
        orderId
      );


      if (!orderId) {

        console.warn(
          '⚠️ Webhook recebido sem data.id.'
        );


        return res.status(200).json({

          recebido:
            true

        });

      }


      // -----------------------------------------------------
      // TOKEN
      // -----------------------------------------------------

      const accessToken =
        process.env.MERCADOPAGO_ACCESS_TOKEN;


      if (!accessToken) {

        console.error(
          '❌ MERCADOPAGO_ACCESS_TOKEN não configurado.'
        );


        return res.status(500).json({

          mensagem:
            'Token do Mercado Pago não configurado.'

        });

      }


      // -----------------------------------------------------
      // BUSCA ORDER
      // -----------------------------------------------------

      const response =
        await fetch(

          `https://api.mercadopago.com/v1/orders/${orderId}`,

          {

            method:
              'GET',

            headers: {

              Authorization:
                `Bearer ${accessToken}`,

              'Content-Type':
                'application/json'

            }

          }

        );


      if (!response.ok) {

        const erroTexto =
          await response.text();


        console.error(
          '❌ Mercado Pago retornou erro:',
          response.status,
          erroTexto
        );


        return res.status(200).json({

          recebido:
            true,

          erroMercadoPago:
            response.status

        });

      }


      const order =
        await response.json();


      console.log('==========================================');
      console.log('📦 ORDER RECEBIDA');
      console.log('==========================================');

      console.log(
        'Order ID:',
        order?.id
      );

      console.log(
        'Status:',
        order?.status
      );

      console.log(
        'Status Detail:',
        order?.status_detail
      );

      console.log(
        'External Reference:',
        order?.external_reference
      );

      console.log('==========================================');


      // -----------------------------------------------------
      // REFERÊNCIA
      // -----------------------------------------------------

      const externalReference =
        order?.external_reference;


      if (!externalReference) {

        console.warn(
          '⚠️ Order sem external_reference.'
        );


        return res.status(200).json({

          recebido:
            true

        });

      }


      // -----------------------------------------------------
      // PEDIDO
      // -----------------------------------------------------

      const pedido =
        await this.pedidoRepository.findOne({

          where: {

            numeroPedido:
              externalReference

          }

        });


      if (!pedido) {

        console.warn(
          `⚠️ Pedido ${externalReference} não encontrado no banco.`
        );


        return res.status(200).json({

          recebido:
            true

        });

      }


      // -----------------------------------------------------
      // PAYMENT
      // -----------------------------------------------------

      const pagamento =
        order.transactions
          ?.payments?.[0];


      const statusOrder =
        order?.status;


      const statusDetail =
        order?.status_detail;


      const statusPagamento =
        pagamento?.status;


      const paymentId =
        pagamento?.id;


      // -----------------------------------------------------
      // IDS
      // -----------------------------------------------------

      pedido.gateway =
        'mercadopago';


      pedido.gatewayOrderId =
        order?.id
          ? String(order.id)
          : pedido.gatewayOrderId;


      pedido.gatewayPaymentId =
        paymentId
          ? String(paymentId)
          : pedido.gatewayPaymentId;


      // =====================================================
      // MÉTODO DE PAGAMENTO
      // =====================================================

      const paymentMethodType =
        pagamento?.payment_method?.type;


      if (
        paymentMethodType ===
        'credit_card'
      ) {

        pedido.metodoPagamento =
          'cartao';

      } else {

        pedido.metodoPagamento =
          'pix';

      }


      // =====================================================
      // APROVADO
      // =====================================================

      if (

        statusPagamento ===
          'approved'

        ||

        (
          statusOrder ===
            'processed'

          &&

          statusDetail ===
            'accredited'
        )

      ) {

        pedido.statusPagamento =
          'APROVADO';

        pedido.statusPedido =
          'PAGAMENTO_APROVADO';


        console.log(
          `✅ Pagamento aprovado para o pedido ${pedido.numeroPedido}.`
        );

      }


      // =====================================================
      // PENDENTE
      // =====================================================

      else if (

        statusOrder ===
          'action_required'

        ||

        statusPagamento ===
          'pending'

      ) {

        pedido.statusPagamento =
          'PENDENTE';

        pedido.statusPedido =
          'AGUARDANDO_PAGAMENTO';


        console.log(
          `⏳ Pagamento pendente para o pedido ${pedido.numeroPedido}.`
        );

      }


      // =====================================================
      // RECUSADO
      // =====================================================

      else if (

        statusOrder ===
          'failed'

        ||

        statusPagamento ===
          'rejected'

      ) {

        pedido.statusPagamento =
          'RECUSADO';

        pedido.statusPedido =
          'AGUARDANDO_PAGAMENTO';


        console.log(
          `❌ Pagamento recusado para o pedido ${pedido.numeroPedido}.`
        );

      }


      // =====================================================
      // CANCELADO / EXPIRADO
      // =====================================================

      else if (

        statusOrder ===
          'canceled'

        ||

        statusOrder ===
          'expired'

      ) {

        pedido.statusPagamento =
          'CANCELADO';

        pedido.statusPedido =
          'CANCELADO';


        console.log(
          `🚫 Pagamento cancelado/expirado para o pedido ${pedido.numeroPedido}.`
        );

      }


      // =====================================================
      // ESTORNADO
      // =====================================================

      else if (

        statusOrder ===
          'refunded'

        ||

        statusPagamento ===
          'refunded'

      ) {

        pedido.statusPagamento =
          'ESTORNADO';

        pedido.statusPedido =
          'CANCELADO';


        console.log(
          `↩️ Pagamento estornado para o pedido ${pedido.numeroPedido}.`
        );

      }


      // -----------------------------------------------------
      // SALVA
      // -----------------------------------------------------

      await this.pedidoRepository.save(
        pedido
      );


      console.log('==========================================');
      console.log('✅ WEBHOOK PROCESSADO');
      console.log('==========================================');

      console.log(
        'Pedido:',
        pedido.numeroPedido
      );

      console.log(
        'Método:',
        pedido.metodoPagamento
      );

      console.log(
        'Status pagamento:',
        pedido.statusPagamento
      );

      console.log(
        'Status pedido:',
        pedido.statusPedido
      );

      console.log('==========================================');


      return res.status(200).json({

        recebido:
          true,

        pedido:
          pedido.numeroPedido,

        statusPagamento:
          pedido.statusPagamento,

        statusPedido:
          pedido.statusPedido

      });


    } catch (error) {

      console.error('==========================================');
      console.error('❌ ERRO NO WEBHOOK MERCADO PAGO');
      console.error('==========================================');

      console.error(
        error
      );

      console.error('==========================================');


      return res.status(200).json({

        recebido:
          true,

        erro:
          'Erro interno ao processar webhook.'

      });

    }

  }

}


export default new PedidoController();