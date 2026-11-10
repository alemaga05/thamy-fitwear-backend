
import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";

import { Produto } from "./entities/Produto";
import { User } from "./entities/User";
import { Endereco } from "./entities/Endereco";
import { Favorito } from "./entities/Favorito";
import { Carrinho } from "./entities/Carrinho";
import { Categoria } from "./entities/Categoria";
import { Pedido } from "./entities/Pedido";
import { PedidoItem } from "./entities/PedidoItem";
import { Banner } from "./entities/Banner";
import { ConfiguracaoLoja } from "./entities/ConfiguracaoLoja";

// Carrega as variáveis de ambiente
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Em produção, a sincronização automática fica sempre desativada.
const synchronize = !isProduction &&
    process.env.DB_SYNCHRONIZE === "true";

const databaseHost = process.env.DB_HOST || "localhost";

const databasePort = Number(process.env.DB_PORT) || 5432;

export const AppDataSource = new DataSource({
    type: "postgres",

    host: databaseHost,
    port: databasePort,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    ssl:
        process.env.DB_SSL === "true"
            ? { rejectUnauthorized: false }
            : false,

    synchronize,
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
        Banner,
        ConfiguracaoLoja,
    ]
});
