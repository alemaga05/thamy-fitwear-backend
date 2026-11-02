import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";

import { User } from "./User";

@Entity("enderecos")
export class Endereco {

  @PrimaryGeneratedColumn()
  id!: number;

  // CEP informado pelo usuário
  @Column({ type: "varchar", length: 9, nullable: true })
  cep!: string | null;
  // Preenchido automaticamente através do CEP
  @Column({ type: "varchar", length: 255 })
  rua!: string;

  // Número da residência
  // VARCHAR porque pode existir algo como "123A", "12-B", etc.
  @Column({ type: "varchar", length: 20, nullable: true })
  numero!: string | null;

  // Complemento é opcional
  @Column({ type: "varchar", length: 150, nullable: true })
  complemento!: string | null;

  // Preenchido automaticamente através do CEP
  @Column({ type: "varchar", length: 100 })
  bairro!: string;

  // Preenchido automaticamente através do CEP
  @Column({ type: "varchar", length: 100 })
  cidade!: string;

  // Preenchido automaticamente através do CEP
  @Column({ type: "varchar", length: 2, nullable: true })
  estado!: string | null;

  @Column({
    type: "varchar",
    length: 50,
    default: "Brasil"
  })
  pais!: string;

  // Indica se este é o endereço utilizado como principal
  @Column({
    type: "boolean",
    default: false
  })
  principal!: boolean;

  // Vários endereços podem pertencer a um usuário
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "usuario_id" })
  user!: User;
}