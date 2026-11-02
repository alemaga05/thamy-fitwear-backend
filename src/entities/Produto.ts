import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("produtos")
class Produto {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 150 })
    nome!: string;

    @Column({ type: "text" })
    descricao!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    preco!: number;

    // Categoria principal: 'masculino', 'feminino', 'acessorios', 'conjuntos'
    @Column({ type: "varchar", length: 100 })
    categoria!: string; 

    // Subcategoria: 'regata', 'shorts', 'camisa', 'calca', 'tops', 'leggings', etc.
    @Column({ type: "varchar", length: 100, nullable: true })
    subcategoria!: string;

    // Tamanhos disponíveis salvos como texto ou array (Ex: "P, M, G, GG")
    @Column({ type: "varchar", length: 100, nullable: true })
    tamanhos!: string;

    @Column({ type: "int", default: 0 })
    estoque!: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    imagemUrl!: string;

    @CreateDateColumn({ type: "timestamp" })
    criadoEm!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    atualizadoEm!: Date;

    @Column({ type: "boolean", default: false })
    popular!: boolean;

}

export { Produto };