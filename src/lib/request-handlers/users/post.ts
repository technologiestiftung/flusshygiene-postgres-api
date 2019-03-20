import { validate } from 'class-validator';
import { getRepository } from 'typeorm';
import { Region } from '../../../orm/entity/Region';
import { User } from '../../../orm/entity/User';
import { HttpCodes, postResponse, Regions, UserRole } from '../../types-interfaces';
import { getEntityFields } from '../../utils/get-entity-fields';
import { errorResponse, responder, responderMissingBodyValue, responderSuccessCreated} from '../responders';
import { responderWrongId } from './../responders';

//  █████╗ ██████╗ ██████╗
// ██╔══██╗██╔══██╗██╔══██╗
// ███████║██║  ██║██║  ██║
// ██╔══██║██║  ██║██║  ██║
// ██║  ██║██████╔╝██████╔╝
// ╚═╝  ╚═╝╚═════╝ ╚═════╝

export const addUser: postResponse = async (request, response) => {
  const user: User = new User();
  try {
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

    if (request.body.hasOwnProperty('role') === true && request.body.role === UserRole.creator) {
      if (request.body.region === undefined) {
        responderMissingBodyValue(response, example);
      } else {
        if (!(request.body.region in Regions)) {
          responderMissingBodyValue(response, Regions);
        } else {
          const region = await getRepository(Region).findOne({where: {name: request.body.region}});
          if (region === undefined) {
            responderWrongId(response);
          } else {
            user.regions = [region];
          }
        }
      }
    }

    user.firstName = request.body.firstName;
    user.lastName = request.body.lastName;
    user.role = request.body.role;
    user.email = request.body.email;
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new Error(`User validation failed ${JSON.stringify(errors)}`);
    }
    // could also be the below create event
    // but then we can't do the validation beforehand
    // const res = await getRepository(User).create(request.body);
    const res = await getRepository(User).save(user); // .save(user);
    responderSuccessCreated(response, 'User was created', [res]);
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};
