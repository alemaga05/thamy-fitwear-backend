
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfiguracaoLoja1794787200000
    implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const tabelaExiste = await queryRunner.hasTable(
            "configuracao_loja"
        );

        if (tabelaExiste) {
            // A tabela já existe. Preserva sua estrutura e seus dados.
            const configuracao = await queryRunner.query(`
                SELECT "id"
                FROM "configuracao_loja"
                WHERE "id" = 1
            `);

            if (configuracao.length === 0) {
                await queryRunner.query(`
                    INSERT INTO "configuracao_loja"
                    (
                        "id",
                        "modalidadeFrete",
                        "valorFreteFixo",
                        "ativo"
                    )
                    VALUES (1, 'GRATIS', 0, TRUE)
                `);
            }

            return;
        }

        await queryRunner.query(`
            CREATE TABLE "configuracao_loja" (
                "id" SERIAL NOT NULL,
                "modalidadeFrete" VARCHAR(20) NOT NULL DEFAULT 'GRATIS',
                "valorFreteFixo" DECIMAL(10,2) NOT NULL DEFAULT 0,
                "ativo" BOOLEAN NOT NULL DEFAULT TRUE,
                "criadoEm" TIMESTAMP NOT NULL DEFAULT now(),
                "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_configuracao_loja" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "configuracao_loja"
            ("id", "modalidadeFrete", "valorFreteFixo", "ativo")
            VALUES (1, 'GRATIS', 0, TRUE)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Não remove a tabela para preservar configurações existentes.
    }
}
