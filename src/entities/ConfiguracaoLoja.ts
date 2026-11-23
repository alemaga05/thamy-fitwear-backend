
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

// Modalidades de frete permitidas
export type ModalidadeFrete = "GRATIS" | "FIXO";

@Entity("configuracao_loja")
export class ConfiguracaoLoja {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 20,
        default: "GRATIS"
    })
    modalidadeFrete!: ModalidadeFrete;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0
    })
    valorFreteFixo!: number;

    @Column({
        type: "boolean",
        default: true
    })
    ativo!: boolean;

    @CreateDateColumn()
    criadoEm!: Date;

    @UpdateDateColumn()
    atualizadoEm!: Date;
}
