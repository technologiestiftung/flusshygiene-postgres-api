import { User } from '../../orm/entity/User';

import { getCustomRepository } from 'typeorm';

import { UserRepository } from './UserRepository';

export const getUserWithRelations: (userId: number, relations:string[])=> Promise<User|undefined> = async (userId, relations)=>{
  const userRepo = getCustomRepository(UserRepository);
  try{
    const user = await userRepo.findByIdWithRelations(userId, relations);// await getRepository(User)
    return user;
  }catch(e){
    throw e;
  }
}
