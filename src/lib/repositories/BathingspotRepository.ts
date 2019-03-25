import { EntityRepository, Repository } from 'typeorm';
import { Bathingspot } from '../../orm/entity/Bathingspot';

@EntityRepository(Bathingspot)
export class BathingspotRepository extends Repository<Bathingspot> {
  public findById(id: number) {
    return this.findOne(id);
  }

  public findByUserAndSpotId(userId: number, spotId: number) {
    /*

    const sqlQueryFail = this.createQueryBuilder('bathingspot')
    // .where(`"bathingspot"."userId" = ${userId}`)
    .where('bathingspot.userId = :id', {id: userId})
    .andWhere('bathingspot.id = :id', {id: spotId}).getSql();
    console.log('failing query 1', sqlQueryFail);

    const sqlQueryAlsoFail = this.createQueryBuilder('bathingspot')
    // .where(`"bathingspot"."userId" = ${userId}`)
    .where('"bathingspot"."userId" = :id', {id: userId})
    .andWhere('bathingspot.id = :id', {id: spotId}).getSql();
    console.log('failing query 2', sqlQueryAlsoFail);

    const sqlQueryWork = this.createQueryBuilder('bathingspot')
    .where(`"bathingspot"."userId" = ${userId}`)
    // .where('"bathingspot"."userId" = :id', {id: userId})
    .andWhere('bathingspot.id = :id', {id: spotId}).getSql();
    console.log('working query', sqlQueryWork);

    const spot = this.createQueryBuilder('bathingspot')
    // .where(`"bathingspot"."userId" = ${userId}`)
    // fails but should be right
    // .where('"bathingspot"."userId" = :id', {id: userId})
    .where('bathingspot.userId = :id', {id: userId})
    .andWhere('bathingspot.id = :id', {id: spotId}).getOne();
    // console.log('in CustomRepo.findByUserAndSpotId', spot);
    */
   const spot = this.createQueryBuilder('bathingspot')
   .innerJoin('bathingspot.user', 'user')
     .where('user.id = :uid', { uid: userId })
     .andWhere('bathingspot.id = :sid', { sid: spotId }).getOne();
   return spot;
  }
}
