import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("banners")
export class Banner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  titulo!: string;

  @Column({ type: "varchar", length: 500 })
  imagemUrl!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  link!: string | null;

  @Column({ type: "boolean", default: true })
  ativo!: boolean;

  @Column({ type: "int", default: 0 })
  ordem!: number;

  @CreateDateColumn({ type: "timestamp" })
  criadoEm!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  atualizadoEm!: Date;
}
