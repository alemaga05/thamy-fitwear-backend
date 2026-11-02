import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';

import { User } from './User';
import { PedidoItem } from './PedidoItem';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  user!: User;

  // =========================
  // IDENTIFICAÇÃO DO PEDIDO
  // =========================

  @Column({ type: 'varchar', length: 30, unique: true })
  numeroPedido!: string;

  // =========================
  // DADOS DO CLIENTE
  // =========================

  @Column({ type: 'varchar', length: 150 })
  nomeCliente!: string;

  @Column({ type: 'varchar', length: 150 })
  emailCliente!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefoneCliente!: string | null;

  // =========================
  // ENDEREÇO DE ENTREGA
  // =========================

  @Column({ type: 'varchar', length: 255 })
  ruaEntrega!: string;

  @Column({ type: 'varchar', length: 100 })
  bairroEntrega!: string;

  @Column({ type: 'varchar', length: 100 })
  cidadeEntrega!: string;

  @Column({ type: 'varchar', length: 50, default: 'Brasil' })
  paisEntrega!: string;

  // =========================
  // VALORES
  // =========================

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorSubtotal!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorFrete!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal!: number;

  // =========================
  // PAGAMENTO
  // =========================

  @Column({ type: 'varchar', length: 20, default: 'PENDENTE' })
  statusPagamento!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  metodoPagamento!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  gateway!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  gatewayOrderId!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  gatewayPaymentId!: string | null;

  // =========================
  // STATUS DO PEDIDO
  // =========================

  @Column({
    type: 'varchar',
    length: 30,
    default: 'AGUARDANDO_PAGAMENTO'
  })
  statusPedido!: string;

  // =========================
  // ITENS
  // =========================

  @OneToMany(() => PedidoItem, item => item.pedido, {
    cascade: true
  })
  itens!: PedidoItem[];

  // =========================
  // DATAS
  // =========================

  @CreateDateColumn({ type: 'timestamp' })
  criadoEm!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  atualizadoEm!: Date;
}