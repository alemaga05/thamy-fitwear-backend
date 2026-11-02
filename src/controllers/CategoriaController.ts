import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Categoria } from '../entities/Categoria';

export class CategoriaController {

  // =====================================================
  // LISTAR TODAS
  // =====================================================

  async getAll(req: Request, res: Response): Promise<any> {

    try {

      const categoriaRepository =
        AppDataSource.getRepository(Categoria);

      const categorias =
        await categoriaRepository.find({
          order: {
            ordem: 'ASC'
          }
        });

      return res.status(200).json(categorias);

    } catch (error) {

      console.error(
        'Erro ao buscar categorias:',
        error
      );

      return res.status(500).json({
        mensagem: 'Erro ao buscar categorias.'
      });
    }
  }


  // =====================================================
  // BUSCAR POR ID
  // =====================================================

  async getById(req: Request, res: Response): Promise<any> {

    try {

      const { id } = req.params;

      const categoriaRepository =
        AppDataSource.getRepository(Categoria);

      const categoria =
        await categoriaRepository.findOneBy({
          id: Number(id)
        });

      if (!categoria) {

        return res.status(404).json({
          mensagem: 'Categoria não encontrada.'
        });
      }

      return res.status(200).json(categoria);

    } catch (error) {

      console.error(
        'Erro ao buscar categoria:',
        error
      );

      return res.status(500).json({
        mensagem: 'Erro ao buscar categoria.'
      });
    }
  }


  // =====================================================
  // CRIAR
  // =====================================================

  async create(req: Request, res: Response): Promise<any> {

    try {

      const {
        nome,
        tipo,
        imagemUrl,
        ordem
      } = req.body;


      // -----------------------------
      // VALIDAÇÕES
      // -----------------------------

      if (!nome || !nome.trim()) {

        return res.status(400).json({
          mensagem: 'O nome da categoria é obrigatório.'
        });
      }


      if (
        tipo !== 'feminino' &&
        tipo !== 'masculino' &&
        tipo !== 'topbar'
      ) {

        return res.status(400).json({
          mensagem: 'Tipo de categoria inválido.'
        });
      }


      const categoriaRepository =
        AppDataSource.getRepository(Categoria);


      // -----------------------------
      // CRIA
      // -----------------------------

      const novaCategoria =
        categoriaRepository.create({

          nome: nome.trim(),

          tipo,

          imagemUrl:
            imagemUrl || '',

          ordem:
            ordem !== undefined
              ? Number(ordem)
              : 1

        });


      await categoriaRepository.save(
        novaCategoria
      );


      return res.status(201).json(
        novaCategoria
      );

    } catch (error) {

      console.error(
        'Erro ao criar categoria:',
        error
      );

      return res.status(500).json({
        mensagem: 'Erro interno ao criar categoria.'
      });
    }
  }


  // =====================================================
  // ATUALIZAR
  // =====================================================

  async update(req: Request, res: Response): Promise<any> {

    try {

      const { id } = req.params;

      const {
        nome,
        tipo,
        imagemUrl,
        ordem
      } = req.body;


      const categoriaRepository =
        AppDataSource.getRepository(Categoria);


      const categoria =
        await categoriaRepository.findOneBy({
          id: Number(id)
        });


      if (!categoria) {

        return res.status(404).json({
          mensagem: 'Categoria não encontrada.'
        });
      }


      // -----------------------------
      // VALIDA NOME
      // -----------------------------

      if (
        nome !== undefined &&
        (!nome || !nome.trim())
      ) {

        return res.status(400).json({
          mensagem: 'O nome da categoria é obrigatório.'
        });
      }


      // -----------------------------
      // VALIDA TIPO
      // -----------------------------

      if (
        tipo !== undefined &&
        tipo !== 'feminino' &&
        tipo !== 'masculino' &&
        tipo !== 'topbar'
      ) {

        return res.status(400).json({
          mensagem: 'Tipo de categoria inválido.'
        });
      }


      // -----------------------------
      // ATUALIZA
      // -----------------------------

      if (nome !== undefined) {
        categoria.nome = nome.trim();
      }

      if (tipo !== undefined) {
        categoria.tipo = tipo;
      }

      if (imagemUrl !== undefined) {
        categoria.imagemUrl = imagemUrl;
      }

      if (ordem !== undefined) {
        categoria.ordem = Number(ordem);
      }


      await categoriaRepository.save(
        categoria
      );


      return res.status(200).json(
        categoria
      );

    } catch (error) {

      console.error(
        'Erro ao atualizar categoria:',
        error
      );

      return res.status(500).json({
        mensagem: 'Erro ao atualizar categoria.'
      });
    }
  }


  // =====================================================
  // EXCLUIR
  // =====================================================

  async delete(req: Request, res: Response): Promise<any> {

    try {

      const { id } = req.params;

      const categoriaRepository =
        AppDataSource.getRepository(Categoria);


      const categoria =
        await categoriaRepository.findOneBy({
          id: Number(id)
        });


      if (!categoria) {

        return res.status(404).json({
          mensagem: 'Categoria não encontrada.'
        });
      }


      await categoriaRepository.remove(
        categoria
      );


      return res.status(200).json({
        mensagem: 'Categoria excluída com sucesso.'
      });

    } catch (error) {

      console.error(
        'Erro ao excluir categoria:',
        error
      );

      return res.status(500).json({
        mensagem: 'Erro ao excluir categoria.'
      });
    }
  }

}