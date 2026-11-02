import dotenv from 'dotenv';
import { MercadoPagoConfig, Order } from 'mercadopago';
import { randomUUID } from 'crypto';

dotenv.config({ override: true });

class MercadoPagoService {
  private order: Order;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    console.log('==========================================');
    console.log('🔐 MERCADO PAGO - DIAGNÓSTICO');
    console.log('==========================================');
    console.log('Token existe:', !!accessToken);
    console.log('Tamanho:', accessToken?.length ?? 0);
    console.log('Prefixo:', accessToken?.substring(0, 7) ?? 'NENHUM');
    console.log('Últimos 4:', accessToken?.slice(-4) ?? 'NENHUM');
    console.log('==========================================');

    if (!accessToken) {
      throw new Error(
        'MERCADOPAGO_ACCESS_TOKEN não foi configurado no arquivo .env.'
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000
      }
    });

    this.order = new Order(client);

    console.log('✅ Cliente Mercado Pago configurado.');
    console.log('==========================================');
  }

  // =====================================================
  // PIX
  // =====================================================

  async criarPix(params: {
  valor: number;
  descricao: string;
  email: string;
  externalReference: string;
}) {

  const {
    valor,
    descricao,
    email,
    externalReference
  } = params;

  console.log('==========================================');
  console.log('💚 CRIANDO ORDER PIX');
  console.log('==========================================');
  console.log('Valor:', Number(valor).toFixed(2));
  console.log('E-mail:', email);
  console.log('External Reference:', externalReference);
  console.log('==========================================');

  try {

    const pedido = await this.order.create({

      body: {

        type: 'online',

        processing_mode: 'automatic',

        total_amount:
          Number(valor).toFixed(2),

        external_reference:
          externalReference,

        payer: {
          email
        },

        transactions: {

          payments: [

            {

              amount:
                Number(valor).toFixed(2),

              payment_method: {

                // PIX
                id: 'pix',

                // Mercado Pago Orders API
                type: 'bank_transfer'

              }

            }

          ]

        },

        description:
          descricao

      },

      requestOptions: {

        idempotencyKey:
          randomUUID()

      }

    });

    console.log('==========================================');
    console.log('✅ ORDER PIX CRIADA');
    console.log('==========================================');

    console.log(
      'Order ID:',
      pedido?.id
    );

    console.log(
      'Status:',
      pedido?.status
    );

    console.log(
      'Status Detail:',
      pedido?.status_detail
    );

    console.log('==========================================');

    return pedido;

  } catch (error: any) {

    console.log('==========================================');
    console.log('❌ ERRO AO CRIAR ORDER PIX');
    console.log('==========================================');

    console.error(
      'Status HTTP:',
      error?.status
    );

    console.error(
      'Erro:',
      error
    );

    // Tentar mostrar a resposta detalhada
    if (error?.cause) {
      console.error(
        'Cause:',
        error.cause
      );
    }

    if (error?.causes) {
      console.error(
        'Causes:',
        error.causes
      );
    }

    if (error?.response) {
      console.error(
        'Response:',
        error.response
      );
    }

    console.log('==========================================');

    throw error;
  }
}

  // =====================================================
  // CARTÃO
  // =====================================================

  async criarPagamentoCartao(params: {
    valor: number;
    descricao: string;
    token: string;
    installments: number;
    paymentMethodId: string;
    email: string;
    identificationType: string;
    identificationNumber: string;
    externalReference: string;
  }) {

    const {
      valor,
      descricao,
      token,
      installments,
      paymentMethodId,
      email,
      identificationType,
      identificationNumber,
      externalReference
    } = params;

    console.log('==========================================');
    console.log('💳 CRIANDO ORDER CARTÃO');
    console.log('==========================================');

    console.log(
      'Valor:',
      Number(valor).toFixed(2)
    );

    console.log(
      'E-mail:',
      email
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
      'Token recebido:',
      token ? 'SIM' : 'NÃO'
    );

    console.log(
      'CPF recebido:',
      identificationNumber ? 'SIM' : 'NÃO'
    );

    console.log(
      'External Reference:',
      externalReference
    );

    console.log('==========================================');

    try {

      const order = await this.order.create({

        body: {

          type: 'online',

          processing_mode: 'automatic',

          total_amount:
            Number(valor).toFixed(2),

          external_reference:
            externalReference,

          payer: {
            email,

            identification: {
              type: identificationType,
              number: identificationNumber
            }
          },

          transactions: {

            payments: [

              {

                amount:
                  Number(valor).toFixed(2),

                payment_method: {

                  id:
                    paymentMethodId,

                  type:
                    'credit_card',

                  token:
                    token,

                  installments:
                    Number(installments)
                }
              }
            ]
          }
        },

        requestOptions: {

          idempotencyKey:
            randomUUID()
        }
      });

      console.log('==========================================');
      console.log('✅ ORDER CARTÃO CRIADA');
      console.log('==========================================');

      console.log(
        'Order ID:',
        order.id
      );

      console.log(
        'Status:',
        order.status
      );

      console.log(
        'Status Detail:',
        order.status_detail
      );

      const pagamento =
        order.transactions
          ?.payments?.[0];

      console.log(
        'Payment ID:',
        pagamento?.id
      );

      console.log(
        'Payment Status:',
        pagamento?.status
      );

      console.log(
        'Payment Status Detail:',
        pagamento?.status_detail
      );

      console.log('==========================================');

      return order;

    } catch (error) {

      console.error('==========================================');
      console.error('❌ ERRO AO CRIAR ORDER CARTÃO');
      console.error('==========================================');

      console.error(error);

      throw error;
    }
  }
}

export default new MercadoPagoService();