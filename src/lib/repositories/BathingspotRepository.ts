import { EntityRepository, Repository } from 'typeorm';
import { Bathingspot } from '../../orm/entity/Bathingspot';

@EntityRepository(Bathingspot)
export class BathingspotRepository extends Repository<Bathingspot>{
  findById(spot: number) {
    return this.findOne(spot);
  }
}
