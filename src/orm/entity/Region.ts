import { IsEnum } from 'class-validator';
import { BeforeRemove, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Regions } from '../../lib/types-interfaces';
import { Bathingspot } from './Bathingspot';
import { User } from './User';
@Entity()
export class Region {

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({nullable: false})
  public displayName!: string;

  // if he can create badegewässer/bathing spot
  @Column({ type: 'enum', nullable: false, enum: Regions })
  @IsEnum(Regions)
  public name!: string;

  @OneToMany(_type => Bathingspot, bathingspot => bathingspot.user, {
    cascade: true, onDelete: 'SET NULL',
  })
  public bathingspots!: Bathingspot[];

  @ManyToMany(_type => User, user => user.regions, {cascade: true})
  @JoinTable()
  public users!: User[];

  @BeforeRemove()
  public makeSpotsPrivate() {
    this.bathingspots.forEach((spot) => {
      spot.isPublic = false;
      console.log(spot);
    });
  }
}
