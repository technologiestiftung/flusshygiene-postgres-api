import { EntityRepository, Repository } from 'typeorm';
import { User } from '../../orm/entity/User';

@EntityRepository(User)
export class UserRepository extends Repository<User>{
  findByIdWithRelations(userId: number, relations: string[]) {
    return this.findOne(userId, { relations: relations });
  }
}
