import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeRemove,
  getRepository,
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

  @OneToMany((_type) => RModelFile, (file) => file.model, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public rmodelfiles!: RModelFile[];

  @OneToMany((_type) => PlotFile, (plotFile) => plotFile.model, {
    eager: true,
    onDelete: 'CASCADE',
  })
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

  @BeforeRemove()
  async removeAllRelations() {
    try {
      const plotRepo = getRepository(PlotFile);
      const modelFilesRepo = getRepository(RModelFile);
      const plotFiles = await plotRepo.find({ where: { modelId: this.id } });
      const rmodelFiles = await modelFilesRepo.find({
        where: { modelId: this.id },
      });
      for (const plot of plotFiles) {
        plotRepo.remove(plot);
      }
      for (const rmodel of rmodelFiles) {
        modelFilesRepo.remove(rmodel);
      }
      // plotFiles
    } catch (error) {}
    //   .then((plots) => {
    //     plots.forEach((plot) => {
    //       plotRepo
    //         .remove(plot)
    //         .then((res) => {
    //           console.info(res);
    //         })
    //         .catch((err) => {
    //           console.error(err);
    //         });
    //     });
    //   })
    //   .catch((err) => {
    //     console.error('Error removing plot files');

    //     console.error(err);
    //   });

    // rmodelFiles
    //   .then((files) => {
    //     files.forEach((file) => {
    //       modelFilesRepo
    //         .remove(file)
    //         .then()
    //         .catch((err) => console.error(err));
    //     });
    //   })
    //   .catch((err) => {
    //     console.error('Error removing model files');

    //     console.error(err);
    //   });
  }
}
