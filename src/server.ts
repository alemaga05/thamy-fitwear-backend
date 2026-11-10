
import 'dotenv/config';
import 'reflect-metadata';

import express from 'express';
import cors from 'cors';

import routes from './routes';
import { AppDataSource } from './data-source';

// =====================================================
// EXPRESS
// =====================================================
const app = express();

// =====================================================
// CORS
// =====================================================
const isProduction = process.env.NODE_ENV === 'production';

const frontendOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

if (!isProduction) {
    frontendOrigins.push('http://localhost:4200');
}

app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem origem, como chamadas de servidor.
        if (!origin || frontendOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origem não autorizada pelo CORS.'));
    }
}));

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
const PORT = Number(process.env.PORT) || 3000;

// =====================================================
// INICIALIZAÇÃO DO BANCO DE DADOS E SERVIDOR
// =====================================================
AppDataSource.initialize()
    .then(() => {
        console.log('Banco de dados PostgreSQL conectado com sucesso!');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor iniciado na porta ${PORT}.`);
        });
    })
    .catch((error) => {
        console.error('Erro ao conectar com o banco de dados:', error);
        process.exitCode = 1;
    });
