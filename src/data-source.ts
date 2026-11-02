import { DataSource } from "typeorm";
import { Produto } from "./entities/Produto";
import { User } from "./entities/User";
import { Endereco } from "./entities/Endereco"; 
import { Favorito } from "./entities/Favorito"; 
import { Carrinho } from "./entities/Carrinho"; 
import { Categoria } from './entities/Categoria';
import { Pedido } from "./entities/Pedido";
import { PedidoItem } from "./entities/PedidoItem";
import { Banner } from "./entities/Banner";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres", // Seu usuário do PostgreSQL
    password: "admin", // Sua senha do pgAdmin
    database: "thamy_db",
    synchronize: true, // Faz a mágica de criar as tabelas sozinho
    logging: false,
    entities: [
    User,
    Endereco,
    Favorito,
    Carrinho,
    Produto,
    Categoria,
    Pedido,
    PedidoItem,
    Banner
  ],
});