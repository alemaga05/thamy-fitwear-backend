import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('categorias')
export class Categoria {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 100
  })
  nome!: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  tipo!: 'feminino' | 'masculino' | 'topbar';

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true
  })
  imagemUrl!: string;

  @Column({
    type: 'int',
    default: 1
  })
  ordem!: number;

  @CreateDateColumn({
    type: 'timestamp'
  })
  criadoEm!: Date;

  @UpdateDateColumn({
    type: 'timestamp'
  })
  atualizadoEm!: Date;
}