
import dotenv from 'dotenv';
import { MercadoPagoConfig, Order } from 'mercadopago';
import { randomUUID } from 'crypto';

// Não sobrescreve variáveis configuradas pela hospedagem.
dotenv.config();

class MercadoPagoService {
  private order: Order;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        'MERCADOPAGO_ACCESS_TOKEN não foi configurado.'
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000
      }
    });

    this.order = new Order(client);

    console.log('Cliente Mercado Pago configurado.');
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

    try {
      const pedido = await this.order.create({
        body: {
          type: 'online',
          processing_mode: 'automatic',
          total_amount: Number(valor).toFixed(2),
          external_reference: externalReference,
          payer: {
            email
          },
          transactions: {
            payments: [
              {
                amount: Number(valor).toFixed(2),
                payment_method: {
                  id: 'pix',
                  type: 'bank_transfer'
                }
              }
            ]
          },
          description: descricao
        },
        requestOptions: {
          idempotencyKey: randomUUID()
        }
      });

      console.log('Order PIX criada com sucesso.');
      console.log('Order ID:', pedido?.id);
      console.log('Status:', pedido?.status);

      return pedido;

    } catch (error: unknown) {
      const erro = error as {
        status?: number;
        message?: string;
      };

      console.error('Erro ao criar Order PIX.');
      console.error('Status HTTP:', erro?.status ?? 'Não informado');
      console.error('Mensagem:', erro?.message ?? 'Erro não identificado');

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

    try {
      const order = await this.order.create({
        body: {
          type: 'online',
          processing_mode: 'automatic',
          total_amount: Number(valor).toFixed(2),
          external_reference: externalReference,
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
                amount: Number(valor).toFixed(2),
                payment_method: {
                  id: paymentMethodId,
                  type: 'credit_card',
                  token,
                  installments: Number(installments)
                }
              }
            ]
          },
          description: descricao
        },
        requestOptions: {
          idempotencyKey: randomUUID()
        }
      });

      console.log('Order de cartão criada com sucesso.');
      console.log('Order ID:', order.id);
      console.log('Status:', order.status);

      const pagamento = order.transactions?.payments?.[0];

      console.log('Payment ID:', pagamento?.id);
      console.log('Payment Status:', pagamento?.status);

      return order;

    } catch (error: unknown) {
      const erro = error as {
        status?: number;
        message?: string;
      };

      console.error('Erro ao criar Order de cartão.');
      console.error('Status HTTP:', erro?.status ?? 'Não informado');
      console.error('Mensagem:', erro?.message ?? 'Erro não identificado');

      throw error;
    }
  }
}

export default new MercadoPagoService();
