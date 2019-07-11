import { BathingspotCategories } from './../../lib/common/index';
import {
  Entity,
  ManyToOne,
  Column,
} from 'typeorm';
import { Bathingspot } from './Bathingspot';
import { AbstractItem } from './AbstractItem';


@Entity()
export class BathingspotCategory extends AbstractItem {

  @Column(
    {
      type: 'enum',
      enum: BathingspotCategories,
      default: BathingspotCategories.default,
    })

  @ManyToOne( _type => Bathingspot, bathingspot => bathingspot.genericInputs , {
    cascade: true,
  })
  public bathingspot!: Bathingspot;
}
