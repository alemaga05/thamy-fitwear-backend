import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "varchar", length: 150, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    // NOVAS COLUNAS ADICIONADAS AQUI:
    @Column({ type: "varchar", length: 20, nullable: true })
    telefone!: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    dataNascimento!: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}