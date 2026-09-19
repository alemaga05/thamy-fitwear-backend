import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("enderecos")
export class Endereco {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    rua!: string;

    @Column({ type: "varchar", length: 100 })
    bairro!: string;

    @Column({ type: "varchar", length: 100 })
    cidade!: string;

    @Column({ type: "varchar", length: 50, default: 'Brasil' })
    pais!: string;

    @Column({ type: "boolean", default: false })
    principal!: boolean;

    // Relacionamento: Vários endereços podem pertencer a 1 único usuário
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "usuario_id" })
    user!: User;
}