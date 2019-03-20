import { IsEnum } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Regions } from '../../lib/types-interfaces';
import { Bathingspot } from './Bathingspot';
import { User } from './User';
@Entity()
export class Region {

  @PrimaryGeneratedColumn()
  public id!: number;

  // @Column({nullable: false})
  // name!: string;

  // if he can create badegewässer/bathing spot
  @Column({ type: 'enum', nullable: false, enum: Regions })
  @IsEnum(Regions)
  public name!: string;

  @OneToMany(_type => Bathingspot, bathingspot => bathingspot.user, {
    cascade: true,
  })
  public bathingspots!: Bathingspot[];

  @ManyToMany(_type => User, user => user.regions, {cascade: true})
  @JoinTable()
  public users!: User[];

}
