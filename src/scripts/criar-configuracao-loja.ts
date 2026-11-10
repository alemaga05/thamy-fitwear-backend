
import { AppDataSource } from "../data-source";
import { Table } from "typeorm";

async function criarConfiguracaoLoja() {
    try {
        await AppDataSource.initialize();

        console.log("Conexão com o banco estabelecida.");

        const queryRunner = AppDataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const tabelaExiste = await queryRunner.hasTable(
                "configuracao_loja"
            );

            if (!tabelaExiste) {
                console.log("Criando tabela configuracao_loja...");

                await queryRunner.createTable(
                    new Table({
                        name: "configuracao_loja",
                        columns: [
                            {
                                name: "id",
                                type: "integer",
                                isPrimary: true,
                                isGenerated: true,
                                generationStrategy: "increment"
                            },
                            {
                                name: "modalidadeFrete",
                                type: "varchar",
                                length: "20",
                                default: "'GRATIS'"
                            },
                            {
                                name: "valorFreteFixo",
                                type: "numeric",
                                precision: 10,
                                scale: 2,
                                default: "0"
                            },
                            {
                                name: "ativo",
                                type: "boolean",
                                default: true
                            },
                            {
                                name: "criadoEm",
                                type: "timestamp",
                                default: "now()"
                            },
                            {
                                name: "atualizadoEm",
                                type: "timestamp",
                                default: "now()"
                            }
                        ]
                    })
                );

                console.log("Tabela criada com sucesso!");
            } else {
                console.log("A tabela já existe. Nenhuma alteração estrutural realizada.");
            }

            await queryRunner.query(`
                INSERT INTO configuracao_loja
                    ("modalidadeFrete", "valorFreteFixo", "ativo")
                SELECT 'GRATIS', 0, true
                WHERE NOT EXISTS (
                    SELECT 1 FROM configuracao_loja
                );
            `);

            await queryRunner.commitTransaction();

            console.log("Configuração inicial verificada com sucesso.");

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;

        } finally {
            await queryRunner.release();
        }

    } catch (error) {
        console.error("Erro ao preparar configuração da loja:", error);
        process.exitCode = 1;

    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

criarConfiguracaoLoja();
