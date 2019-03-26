import { validate } from 'class-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import { Region } from '../../../orm/entity/Region';
import { User } from '../../../orm/entity/User';
import { RegionRepository } from '../../repositories/RegionRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { HttpCodes, postResponse, UserRole } from '../../types-interfaces';
import { getEntityFields } from '../../utils/get-entity-fields';
import { errorResponse, responder, responderMissingBodyValue, responderSuccessCreated } from '../responders';

//  █████╗ ██████╗ ██████╗
// ██╔══██╗██╔══██╗██╔══██╗
// ███████║██║  ██║██║  ██║
// ██╔══██║██║  ██║██║  ██║
// ██║  ██║██████╔╝██████╔╝
// ╚═╝  ╚═╝╚═════╝ ╚═════╝

const createUser = (obj: any) => {
  const userRepo = getCustomRepository(UserRepository);
  const user: User = new User();
  userRepo.merge(user, obj);
  return user;
};
export const addUser: postResponse = async (request, response) => {
  // const user: User = new User();
  try {
    const regionsRepo = getCustomRepository(RegionRepository);
    let list = await regionsRepo.getNamesList();
    list = list.map(obj => obj.name);

    const example = await getEntityFields('User');
    if (request.body.role === undefined) {
      responderMissingBodyValue(response, example);
    }
    if (!(request.body.role in UserRole)) {
      responderMissingBodyValue(response, example);
    }

    if (request.body.firstName === undefined) {
      responderMissingBodyValue(response, example);
    }
    if (request.body.lastName === undefined) {
      responderMissingBodyValue(response, example);
    }
    if (request.body.email === undefined) {
      responderMissingBodyValue(response, example);
    }
    if ((request.body.hasOwnProperty('role') === true &&
      request.body.role === UserRole.creator)
      &&
      (request.body.hasOwnProperty('region') === true &&
        list.includes(request.body.region) === true)
    ) {
      const region = await getRepository(Region).findOne({ where: { name: request.body.region } });
      if (region === undefined) {
        throw new Error('region does not exist');
      }
      const user = createUser(request.body);
      // user.firstName = request.body.firstName;
      // user.lastName = request.body.lastName;
      // user.role = request.body.role;
      // user.email = request.body.email;
      const errors = await validate(user);
      if (errors.length > 0) {
        throw new Error(`User validation failed ${JSON.stringify(errors)}`);
      }
      // could also be the below create event
      // but then we can't do the validation beforehand
      // const res = await getRepository(User).create(request.body);
      const res = await getRepository(User).save(user); // .save(user);
      responderSuccessCreated(response, 'User was created', [res]);
    } else if ((request.body.hasOwnProperty('role') === true && request.body.role === UserRole.reporter)) {
      const user = createUser(request.body);
      const errors = await validate(user);
      if (errors.length > 0) {
        throw new Error(`User validation failed ${JSON.stringify(errors)}`);
      }
      // could also be the below create event
      // but then we can't do the validation beforehand
      // const res = await getRepository(User).create(request.body);
      const res = await getRepository(User).save(user); // .save(user);
      responderSuccessCreated(response, 'User was created', [res]);
    } else {
      responderMissingBodyValue(response, example);
    }

  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};
