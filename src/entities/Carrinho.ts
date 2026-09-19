import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("carrinho")
export class Carrinho {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    produtoId!: number;

    @Column({ type: "varchar", length: 10 })
    tamanho!: string;

    @Column({ type: "int", default: 1 })
    quantidade!: number;

    // Relacionamento: O item do carrinho pertence a um usuário
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "usuario_id" })
    user!: User;
}