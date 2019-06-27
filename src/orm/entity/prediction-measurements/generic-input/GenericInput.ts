import {
  Entity,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Bathingspot } from '../../Bathingspot';
import { MeasurementType } from '../abstract/MeasurementType';
import { GInputMeasurement } from './GInputMeasurement';


@Entity()
export class GenericInput extends MeasurementType {


  @OneToMany(_type => GInputMeasurement, (measurement) => measurement.genericInput, {eager: true})
  public measurements!: GInputMeasurement[];

  @ManyToOne( _type => Bathingspot, bathingspot => bathingspot.genericInputs , {
    cascade: true,
  })
  public bathingspot!: Bathingspot;
}
