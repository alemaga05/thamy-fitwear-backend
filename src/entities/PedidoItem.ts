import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Pedido } from './Pedido';

@Entity('pedido_itens')
export class PedidoItem {

  @PrimaryGeneratedColumn()
  id!: number;

  // Pedido ao qual este item pertence
  @ManyToOne(
    () => Pedido,
    pedido => pedido.itens,
    {
      onDelete: 'CASCADE'
    }
  )
  @JoinColumn({ name: 'pedido_id' })
  pedido!: Pedido;

  // ID do produto no momento da compra
  @Column({
    type: 'int'
  })
  produtoId!: number;

  // IMPORTANTE:
  // guardamos uma cópia dos dados da compra.
  // Assim alterações futuras no produto não alteram pedidos antigos.

  @Column({
    type: 'varchar',
    length: 150
  })
  nomeProduto!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  precoUnitario!: number;

  @Column({
    type: 'int'
  })
  quantidade!: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true
  })
  tamanho!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  subtotal!: number;

  // Imagem do produto no momento da compra
  // Ajuda a manter o histórico visual do pedido.
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  imagemUrl!: string | null;
}