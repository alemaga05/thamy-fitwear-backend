import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("favoritos")
export class Favorito {
    @PrimaryGeneratedColumn()
    id!: number;

    // Guarda o ID do produto da sua loja
    @Column({ type: "int" })
    produtoId!: number;

    // Relacionamento: O favorito pertence a um usuário
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "usuario_id" })
    user!: User;
}