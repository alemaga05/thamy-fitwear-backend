import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Produto } from '../entities/Produto';

export class ProdutoController {
    
    // 1. CADASTRAR NOVO PRODUTO (Somente Admin)
    async create(req: Request, res: Response): Promise<any> {
  try {

    const {
      nome,
      descricao,
      preco,
      categoria,
      subcategoria,
      tamanhos,
      estoque,
      imagemUrl,
      popular,
    } = req.body;

    const produtoRepository =
      AppDataSource.getRepository(Produto);

    const novoProduto = produtoRepository.create({

      nome,
      descricao,
      preco,
      categoria,
      subcategoria,
      tamanhos,
      estoque,
      imagemUrl,

      popular:
        popular === true ||
        popular === 1 ||
        popular === 'true',

    });

    const produtoSalvo =
      await produtoRepository.save(novoProduto);

    console.log(
      '⭐ Produto criado:',
      produtoSalvo
    );

    return res.status(201).json(produtoSalvo);

  } catch (error) {

    console.error(
      'Erro ao criar produto:',
      error
    );

    return res.status(500).json({
      mensagem: 'Erro interno ao cadastrar produto.'
    });
  }
}

    // 2. LISTAR TODOS OS PRODUTOS (Público - Para a vitrine e pro painel admin)
    async getAll(req: Request, res: Response): Promise<any> {
        try {
            const produtoRepository = AppDataSource.getRepository(Produto);
            const produtos = await produtoRepository.find();
            
            return res.status(200).json(produtos);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro ao buscar produtos.' });
        }
    }

    // 3. BUSCAR UM PRODUTO PELO ID (Público - Para a tela de detalhes do produto)
    async getById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const produtoRepository = AppDataSource.getRepository(Produto);
            
            const produto = await produtoRepository.findOneBy({ id: Number(id) });

            if (!produto) {
                return res.status(404).json({ mensagem: 'Produto não encontrado.' });
            }

            return res.status(200).json(produto);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro ao buscar produto.' });
        }
    }

    // 4. ATUALIZAR PRODUTO (Somente Admin)
    async update(req: Request, res: Response): Promise<any> {
  try {

    const { id } = req.params;

    const {
      nome,
      descricao,
      preco,
      categoria,
      subcategoria,
      tamanhos,
      estoque,
      imagemUrl,
      popular,
      destaque
    } = req.body;

    const produtoRepository =
      AppDataSource.getRepository(Produto);

    const produto = await produtoRepository.findOneBy({
      id: Number(id)
    });

    if (!produto) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      });
    }

    // Dados básicos
    if (nome !== undefined) {
      produto.nome = nome;
    }

    if (descricao !== undefined) {
      produto.descricao = descricao;
    }

    if (preco !== undefined) {
      produto.preco = preco;
    }

    if (categoria !== undefined) {
      produto.categoria = categoria;
    }

    if (subcategoria !== undefined) {
      produto.subcategoria = subcategoria;
    }

    if (tamanhos !== undefined) {
      produto.tamanhos = tamanhos;
    }

    if (estoque !== undefined) {
      produto.estoque = estoque;
    }

    if (imagemUrl !== undefined) {
      produto.imagemUrl = imagemUrl;
    }

    // ⭐ MAIS POPULARES
    if (popular !== undefined) {

      produto.popular =
        popular === true ||
        popular === 1 ||
        popular === 'true';
    }

    // 🔥 DESTAQUE
    if (destaque !== undefined) {

      produto.destaque =
        destaque === true ||
        destaque === 1 ||
        destaque === 'true';
    }

    const produtoAtualizado =
      await produtoRepository.save(produto);

    console.log(
      '⭐ Produto atualizado:',
      produtoAtualizado
    );

    return res.status(200).json(produtoAtualizado);

  } catch (error) {

    console.error(
      'Erro ao atualizar produto:',
      error
    );

    return res.status(500).json({
      mensagem: 'Erro ao atualizar produto.'
    });
  }
}

    // 5. DELETAR PRODUTO (Somente Admin)
    async delete(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const produtoRepository = AppDataSource.getRepository(Produto);

            const produto = await produtoRepository.findOneBy({ id: Number(id) });
            if (!produto) {
                return res.status(404).json({ mensagem: 'Produto não encontrado.' });
            }

            await produtoRepository.remove(produto);
            return res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ mensagem: 'Erro ao deletar produto.' });
        }
    }
}