import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routes from './routes';
import { AppDataSource } from './data-source';

// =====================================================
// CARREGA AS VARIÁVEIS DO .ENV
// override: true faz o .env ter prioridade sobre
// variáveis de ambiente antigas do Windows.
// =====================================================
dotenv.config({ override: true });

// =====================================================
// DIAGNÓSTICO SEGURO DO MERCADO PAGO
// NÃO exibe o token completo.
// =====================================================
const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

console.log('==========================================');
console.log('🔐 DIAGNÓSTICO MERCADO PAGO');
console.log('==========================================');
console.log(
  'Token configurado:',
  mercadoPagoToken ? 'SIM' : 'NÃO'
);
console.log(
  'Tamanho:',
  mercadoPagoToken?.length ?? 0
);
console.log(
  'Prefixo:',
  mercadoPagoToken?.substring(0, 7) ?? 'NENHUM'
);
console.log('==========================================');

// =====================================================
// EXPRESS
// =====================================================
const app = express();

// =====================================================
// CORS
// =====================================================
app.use(cors());

// =====================================================
// JSON
// =====================================================
app.use(express.json());

// =====================================================
// ROTAS
// =====================================================
app.use(routes);

// =====================================================
// ROTA PRINCIPAL DA API
// =====================================================
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API da Thamy Fitwear está rodando perfeitamente!'
  });
});

// =====================================================
// PORTA
// =====================================================
const PORT = 3000;

// =====================================================
// INICIALIZA BANCO DE DADOS
// =====================================================
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Banco de dados PostgreSQL conectado com sucesso!');

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor rodando na porta http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      '❌ Erro ao conectar com o banco de dados:',
      error
    );
  });