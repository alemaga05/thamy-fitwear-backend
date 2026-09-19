import 'reflect-metadata'; // Obrigatório para o TypeORM funcionar
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { AppDataSource } from './data-source';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Thamy Fitwear está rodando perfeitamente!' });
});

const PORT = 3000;

// Primeiro conecta no banco, depois liga o servidor
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Banco de dados PostgreSQL conectado com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
  });