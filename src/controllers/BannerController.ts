import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Banner } from "../entities/Banner";

export class BannerController {
  private bannerRepository = AppDataSource.getRepository(Banner);

  // Lista os banners ativos para a página inicial
  getPublicos = async (req: Request, res: Response): Promise<void> => {
    try {
      const banners = await this.bannerRepository.find({
        where: { ativo: true },
        order: { ordem: "ASC", id: "ASC" }
      });

      res.status(200).json(banners);
    } catch (error) {
      console.error("Erro ao listar banners públicos:", error);
      res.status(500).json({
        mensagem: "Não foi possível carregar os banners."
      });
    }
  };

  // Lista todos os banners para o painel administrativo
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const banners = await this.bannerRepository.find({
        order: { ordem: "ASC", id: "ASC" }
      });

      res.status(200).json(banners);
    } catch (error) {
      console.error("Erro ao listar banners:", error);
      res.status(500).json({
        mensagem: "Não foi possível listar os banners."
      });
    }
  };

  // Cadastra um banner
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { titulo, imagemUrl, link, ativo, ordem } = req.body;

      if (
        typeof titulo !== "string" ||
        !titulo.trim() ||
        typeof imagemUrl !== "string" ||
        !imagemUrl.trim()
      ) {
        res.status(400).json({
          mensagem: "Título e imagem são obrigatórios."
        });
        return;
      }

      if (titulo.trim().length > 150 || imagemUrl.trim().length > 500) {
        res.status(400).json({
          mensagem: "O título ou o caminho da imagem excede o limite permitido."
        });
        return;
      }

      if (
        link !== undefined &&
        link !== null &&
        (typeof link !== "string" || link.length > 500)
      ) {
        res.status(400).json({
          mensagem: "O link informado é inválido."
        });
        return;
      }

      if (ativo !== undefined && typeof ativo !== "boolean") {
        res.status(400).json({
          mensagem: "O campo ativo deve ser verdadeiro ou falso."
        });
        return;
      }

      const ordemFinal = ordem === undefined ? 0 : Number(ordem);

      if (!Number.isInteger(ordemFinal) || ordemFinal < 0) {
        res.status(400).json({
          mensagem: "A ordem deve ser um número inteiro igual ou maior que zero."
        });
        return;
      }

      const banner = this.bannerRepository.create({
        titulo: titulo.trim(),
        imagemUrl: imagemUrl.trim(),
        link: typeof link === "string" && link.trim()
          ? link.trim()
          : null,
        ativo: ativo === undefined ? true : ativo,
        ordem: ordemFinal
      });

      const salvo = await this.bannerRepository.save(banner);

      res.status(201).json(salvo);
    } catch (error) {
      console.error("Erro ao cadastrar banner:", error);
      res.status(500).json({
        mensagem: "Não foi possível cadastrar o banner."
      });
    }
  };

  // Atualiza um banner existente
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const banner = await this.bannerRepository.findOneBy({ id });

      if (!banner) {
        res.status(404).json({ mensagem: "Banner não encontrado." });
        return;
      }

      const { titulo, imagemUrl, link, ativo, ordem } = req.body;

      if (titulo !== undefined) {
        if (
          typeof titulo !== "string" ||
          !titulo.trim() ||
          titulo.trim().length > 150
        ) {
          res.status(400).json({ mensagem: "Título inválido." });
          return;
        }
        banner.titulo = titulo.trim();
      }

      if (imagemUrl !== undefined) {
        if (
          typeof imagemUrl !== "string" ||
          !imagemUrl.trim() ||
          imagemUrl.trim().length > 500
        ) {
          res.status(400).json({ mensagem: "Caminho da imagem inválido." });
          return;
        }
        banner.imagemUrl = imagemUrl.trim();
      }

      if (link !== undefined) {
        if (
          link !== null &&
          (typeof link !== "string" || link.length > 500)
        ) {
          res.status(400).json({ mensagem: "Link inválido." });
          return;
        }

        banner.link =
          typeof link === "string" && link.trim()
            ? link.trim()
            : null;
      }

      if (ativo !== undefined) {
        if (typeof ativo !== "boolean") {
          res.status(400).json({ mensagem: "Status inválido." });
          return;
        }
        banner.ativo = ativo;
      }

      if (ordem !== undefined) {
        const ordemFinal = Number(ordem);

        if (!Number.isInteger(ordemFinal) || ordemFinal < 0) {
          res.status(400).json({ mensagem: "Ordem inválida." });
          return;
        }

        banner.ordem = ordemFinal;
      }

      const atualizado = await this.bannerRepository.save(banner);

      res.status(200).json(atualizado);
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      res.status(500).json({
        mensagem: "Não foi possível atualizar o banner."
      });
    }
  };

  // Exclui um banner
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ mensagem: "ID inválido." });
        return;
      }

      const banner = await this.bannerRepository.findOneBy({ id });

      if (!banner) {
        res.status(404).json({ mensagem: "Banner não encontrado." });
        return;
      }

      await this.bannerRepository.remove(banner);

      res.status(200).json({
        mensagem: "Banner excluído com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      res.status(500).json({
        mensagem: "Não foi possível excluir o banner."
      });
    }
  };
}