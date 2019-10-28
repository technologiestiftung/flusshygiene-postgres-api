import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Bathingspot } from './Bathingspot';
import { RModelFile } from './RModelFile';
import { PlotFile } from './PlotFile';

@Entity()
export class BathingspotModel {
  @PrimaryGeneratedColumn()
  public id!: number;
  @Column()
  @CreateDateColumn()
  public createdAt!: Date;
  @VersionColumn()
  public version!: number;

  @Column()
  @UpdateDateColumn()
  public updatedAt!: Date;

  @Column({ type: 'text', nullable: true, select: false })
  public rmodel!: string;

  @OneToMany((_type) => RModelFile, (file) => file.model, { eager: true })
  public rmodelfiles!: RModelFile[];

  @OneToMany((_type) => PlotFile, (plotFile) => plotFile.model, { eager: true })
  public plotfiles!: PlotFile[];
  @Column({ type: 'text', nullable: true })
  public comment!: string;
  @Column({ type: 'text', nullable: true })
  public evaluation!: string;

  @ManyToOne((_type) => Bathingspot, (bathingspot) => bathingspot.models, {
    cascade: true,
  })
  public bathingspot!: Bathingspot;

  // @OneToOne((_type) => Report, { eager: true })
  // @JoinColumn()
  // public report!: Report;
}
