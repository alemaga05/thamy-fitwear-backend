
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import {
    ConfiguracaoLoja,
    ModalidadeFrete
} from "../entities/ConfiguracaoLoja";

export class ConfiguracaoLojaController {
    private configuracaoRepository =
        AppDataSource.getRepository(ConfiguracaoLoja);

    // Consulta a configuração atual do frete
    getFrete = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const configuracao =
                await this.configuracaoRepository.findOne({
                    where: { id: 1 }
                });

            if (!configuracao) {
                res.status(404).json({
                    mensagem: "Configuração de frete não encontrada."
                });
                return;
            }

            res.status(200).json(configuracao);

        } catch (error) {
            console.error(
                "Erro ao consultar configuração de frete:",
                error
            );

            res.status(500).json({
                mensagem: "Não foi possível consultar a configuração de frete."
            });
        }
    };

    // Atualiza a configuração do frete
    atualizarFrete = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { modalidadeFrete, valorFreteFixo, ativo } = req.body;

            // Verifica se a modalidade foi informada corretamente
            if (typeof modalidadeFrete !== "string") {
                res.status(400).json({
                    mensagem: "Modalidade de frete inválida."
                });
                return;
            }

            // Mantém a mensagem específica para o cálculo por CEP
            if (modalidadeFrete === "POR_CEP") {
                res.status(400).json({
                    mensagem: "O cálculo por CEP ainda não está disponível."
                });
                return;
            }

            // Permite somente as modalidades implementadas
            if (
                modalidadeFrete !== "GRATIS" &&
                modalidadeFrete !== "FIXO"
            ) {
                res.status(400).json({
                    mensagem: "Modalidade de frete inválida."
                });
                return;
            }

            const modalidadeValidada: ModalidadeFrete = modalidadeFrete;

            const valor = Number(valorFreteFixo);

            if (
                !Number.isFinite(valor) ||
                valor < 0 ||
                !Number.isInteger(valor * 100)
            ) {
                res.status(400).json({
                    mensagem:
                        "O valor do frete deve ser um número válido e não negativo, com até duas casas decimais."
                });
                return;
            }

            if (typeof ativo !== "boolean") {
                res.status(400).json({
                    mensagem:
                        "O campo ativo deve ser verdadeiro ou falso."
                });
                return;
            }

            if (modalidadeValidada === "FIXO" && valor <= 0) {
                res.status(400).json({
                    mensagem:
                        "Informe um valor maior que zero para o frete fixo."
                });
                return;
            }

            if (modalidadeValidada === "GRATIS" && valor !== 0) {
                res.status(400).json({
                    mensagem:
                        "O valor do frete deve ser zero na modalidade grátis."
                });
                return;
            }

            const configuracao =
                await this.configuracaoRepository.findOne({
                    where: { id: 1 }
                });

            if (!configuracao) {
                res.status(404).json({
                    mensagem: "Configuração de frete não encontrada."
                });
                return;
            }

            configuracao.modalidadeFrete = modalidadeValidada;

            configuracao.valorFreteFixo =
                modalidadeValidada === "GRATIS" ? 0 : valor;

            configuracao.ativo = ativo;

            const atualizado =
                await this.configuracaoRepository.save(configuracao);

            res.status(200).json({
                mensagem: "Configuração de frete atualizada com sucesso.",
                configuracao: atualizado
            });

        } catch (error) {
            console.error(
                "Erro ao atualizar configuração de frete:",
                error
            );

            res.status(500).json({
                mensagem:
                    "Não foi possível atualizar a configuração de frete."
            });
        }
    };
}
