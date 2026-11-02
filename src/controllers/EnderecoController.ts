import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Endereco } from "../entities/Endereco";
import { User } from "../entities/User";

export class EnderecoController {

  // ============================================================
  // CRIAR ENDEREÇO
  // ============================================================
  async create(req: Request, res: Response) {

    const {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais,
      principal
    } = req.body;

    const userId = (req as any).userId;

    try {

      const userRepository = AppDataSource.getRepository(User);
      const enderecoRepository = AppDataSource.getRepository(Endereco);

      // ----------------------------------------------------------
      // Verifica usuário
      // ----------------------------------------------------------
      const user = await userRepository.findOneBy({
        id: userId
      });

      if (!user) {
        return res.status(404).json({
          mensagem: "Usuário não encontrado."
        });
      }

      // ----------------------------------------------------------
      // Valida campos obrigatórios
      // ----------------------------------------------------------
      if (!rua || !bairro || !cidade || !numero) {
        return res.status(400).json({
          mensagem: "Rua, número, bairro e cidade são obrigatórios."
        });
      }

      // ----------------------------------------------------------
      // Normaliza CEP
      // ----------------------------------------------------------
      const cepNormalizado = cep
        ? String(cep).replace(/\D/g, "")
        : null;

      if (cepNormalizado && cepNormalizado.length !== 8) {
        return res.status(400).json({
          mensagem: "O CEP informado é inválido."
        });
      }

      // ----------------------------------------------------------
      // Busca endereços existentes
      // ----------------------------------------------------------
      const enderecosExistentes = await enderecoRepository.find({
        where: {
          user: {
            id: userId
          }
        },
        order: {
          id: "DESC"
        }
      });

      // ----------------------------------------------------------
      // Primeiro endereço:
      // obrigatoriamente será principal
      // ----------------------------------------------------------
      const primeiroEndereco = enderecosExistentes.length === 0;

      const deveSerPrincipal =
        primeiroEndereco || principal === true;

      // ----------------------------------------------------------
      // Se este endereço será principal,
      // remove o principal dos outros
      // ----------------------------------------------------------
      if (deveSerPrincipal && enderecosExistentes.length > 0) {

        for (const endereco of enderecosExistentes) {

          if (endereco.principal) {

            endereco.principal = false;

            await enderecoRepository.save(endereco);
          }
        }
      }

      // ----------------------------------------------------------
      // Cria endereço
      // ----------------------------------------------------------
      const novoEndereco = enderecoRepository.create({

        cep: cepNormalizado
          ? this.formatarCep(cepNormalizado)
          : null,

        rua: String(rua).trim(),

        numero: numero
          ? String(numero).trim()
          : null,

        complemento: complemento
          ? String(complemento).trim()
          : null,

        bairro: String(bairro).trim(),

        cidade: String(cidade).trim(),

        estado: estado
          ? String(estado).trim().toUpperCase()
          : null,

        pais: pais
          ? String(pais).trim()
          : "Brasil",

        principal: deveSerPrincipal,

        user
      });

      await enderecoRepository.save(novoEndereco);

      // ----------------------------------------------------------
      // Retorno
      // ----------------------------------------------------------
      return res.status(201).json(
        this.formatarEndereco(novoEndereco)
      );

    } catch (error) {

      console.error(
        "❌ Erro ao criar endereço:",
        error
      );

      return res.status(500).json({
        mensagem: "Erro interno ao cadastrar endereço."
      });
    }
  }


  // ============================================================
  // LISTAR ENDEREÇOS DO USUÁRIO
  // ============================================================
  async getAll(req: Request, res: Response) {

    const userId = (req as any).userId;

    try {

      const enderecoRepository =
        AppDataSource.getRepository(Endereco);

      const enderecos = await enderecoRepository.find({

        where: {
          user: {
            id: userId
          }
        },

        order: {
          principal: "DESC",
          id: "DESC"
        }

      });

      return res.status(200).json(
        enderecos.map(endereco =>
          this.formatarEndereco(endereco)
        )
      );

    } catch (error) {

      console.error(
        "❌ Erro ao buscar endereços:",
        error
      );

      return res.status(500).json({
        mensagem: "Erro interno ao buscar endereços."
      });
    }
  }


  // ============================================================
  // ATUALIZAR ENDEREÇO
  // ============================================================
  async update(req: Request, res: Response) {

    const { id } = req.params;

    const {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais,
      principal
    } = req.body;

    const userId = (req as any).userId;

    try {

      const enderecoRepository =
        AppDataSource.getRepository(Endereco);

      // ----------------------------------------------------------
      // Busca endereço pertencente ao usuário
      // ----------------------------------------------------------
      const endereco = await enderecoRepository.findOne({

        where: {
          id: Number(id),

          user: {
            id: userId
          }
        }

      });

      if (!endereco) {

        return res.status(404).json({
          mensagem:
            "Endereço não encontrado ou não pertence a você."
        });

      }

      // ----------------------------------------------------------
      // Busca todos os endereços do usuário
      // ----------------------------------------------------------
      const enderecos = await enderecoRepository.find({

        where: {
          user: {
            id: userId
          }
        },

        order: {
          id: "ASC"
        }

      });

      // ----------------------------------------------------------
      // Atualização dos campos
      // ----------------------------------------------------------

      if (cep !== undefined) {

        const cepNormalizado =
          cep
            ? String(cep).replace(/\D/g, "")
            : "";

        if (
          cepNormalizado &&
          cepNormalizado.length !== 8
        ) {

          return res.status(400).json({
            mensagem: "O CEP informado é inválido."
          });

        }

        endereco.cep =
          cepNormalizado
            ? this.formatarCep(cepNormalizado)
            : null;
      }


      if (rua !== undefined) {
        endereco.rua =
          String(rua).trim();
      }


      if (numero !== undefined) {
        endereco.numero =
          numero
            ? String(numero).trim()
            : null;
      }


      if (complemento !== undefined) {
        endereco.complemento =
          complemento
            ? String(complemento).trim()
            : null;
      }


      if (bairro !== undefined) {
        endereco.bairro =
          String(bairro).trim();
      }


      if (cidade !== undefined) {
        endereco.cidade =
          String(cidade).trim();
      }


      if (estado !== undefined) {
        endereco.estado =
          estado
            ? String(estado).trim().toUpperCase()
            : null;
      }


      if (pais !== undefined) {
        endereco.pais =
          pais
            ? String(pais).trim()
            : "Brasil";
      }

      // ----------------------------------------------------------
      // REGRA DO PRINCIPAL
      // ----------------------------------------------------------

      const quantidadeEnderecos =
        enderecos.length;

      // Se existe apenas um endereço,
      // ele obrigatoriamente é principal.
      if (quantidadeEnderecos === 1) {

        endereco.principal = true;

      }

      // ----------------------------------------------------------
      // Usuário escolheu este endereço como principal
      // ----------------------------------------------------------
      else if (principal === true) {

        for (const outroEndereco of enderecos) {

          if (
            outroEndereco.id !== endereco.id &&
            outroEndereco.principal
          ) {

            outroEndereco.principal = false;

            await enderecoRepository.save(
              outroEndereco
            );

          }
        }

        endereco.principal = true;
      }

      // ----------------------------------------------------------
      // Usuário tentou tirar o principal
      // ----------------------------------------------------------
      else if (
        principal === false &&
        endereco.principal === true
      ) {

        // Não permitimos que fique sem principal.
        // Procuramos outro endereço para assumir.
        const outroEndereco =
          enderecos.find(
            item =>
              item.id !== endereco.id
          );

        if (outroEndereco) {

          endereco.principal = false;

          outroEndereco.principal = true;

          await enderecoRepository.save(
            outroEndereco
          );

        } else {

          endereco.principal = true;

        }

      }

      // ----------------------------------------------------------
      // Salva
      // ----------------------------------------------------------
      await enderecoRepository.save(
        endereco
      );

      return res.status(200).json(
        this.formatarEndereco(endereco)
      );

    } catch (error) {

      console.error(
        "❌ Erro ao atualizar endereço:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao atualizar endereço."
      });
    }
  }


  // ============================================================
  // EXCLUIR ENDEREÇO
  // ============================================================
  async delete(req: Request, res: Response) {

    const { id } = req.params;

    const userId = (req as any).userId;

    try {

      const enderecoRepository =
        AppDataSource.getRepository(Endereco);

      // ----------------------------------------------------------
      // Busca endereço
      // ----------------------------------------------------------
      const endereco =
        await enderecoRepository.findOne({

          where: {
            id: Number(id),

            user: {
              id: userId
            }
          }

        });

      if (!endereco) {

        return res.status(404).json({
          mensagem:
            "Endereço não encontrado."
        });

      }

      const eraPrincipal =
        endereco.principal;

      // ----------------------------------------------------------
      // Remove
      // ----------------------------------------------------------
      await enderecoRepository.remove(
        endereco
      );

      // ----------------------------------------------------------
      // Se era principal,
      // promove outro endereço
      // ----------------------------------------------------------
      if (eraPrincipal) {

        const outroEndereco =
          await enderecoRepository.findOne({

            where: {
              user: {
                id: userId
              }
            },

            order: {
              id: "DESC"
            }

          });

        if (outroEndereco) {

          outroEndereco.principal = true;

          await enderecoRepository.save(
            outroEndereco
          );

        }
      }

      return res.status(200).json({
        mensagem:
          "Endereço removido com sucesso."
      });

    } catch (error) {

      console.error(
        "❌ Erro ao excluir endereço:",
        error
      );

      return res.status(500).json({
        mensagem:
          "Erro interno ao excluir endereço."
      });
    }
  }


  // ============================================================
  // FORMATA CEP
  // ============================================================
  private formatarCep(cep: string): string {

    const numeros =
      cep.replace(/\D/g, "");

    if (numeros.length !== 8) {
      return numeros;
    }

    return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;
  }


  // ============================================================
  // FORMATA RESPOSTA
  // ============================================================
  private formatarEndereco(
    endereco: Endereco
  ) {

    return {

      id: endereco.id,

      cep: endereco.cep,

      rua: endereco.rua,

      numero: endereco.numero,

      complemento:
        endereco.complemento,

      bairro: endereco.bairro,

      cidade: endereco.cidade,

      estado: endereco.estado,

      pais: endereco.pais,

      principal:
        endereco.principal
    };
  }
}