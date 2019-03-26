import { getCustomRepository, getRepository } from 'typeorm';
import { Region } from '../../../orm/entity/Region';
import { User } from '../../../orm/entity/User';
import { SUCCESS } from '../../messages';
import { getRegionsList } from '../../repositories/custom-repo-helpers';
import { RegionRepository } from '../../repositories/RegionRepository';
import { HttpCodes, putResponse } from '../../types-interfaces';
import { errorResponse, responder, responderWrongId, successResponse } from '../responders';

// ██████╗ ██╗   ██╗████████╗
// ██╔══██╗██║   ██║╚══██╔══╝
// ██████╔╝██║   ██║   ██║
// ██╔═══╝ ██║   ██║   ██║
// ██║     ╚██████╔╝   ██║
// ╚═╝      ╚═════╝    ╚═╝

export const updateUser: putResponse = async (request, response) => {
  try {
    const list = await getRegionsList();
    const user: User | undefined = await getRepository(User).findOne(request.params.userId);
    if (user instanceof User)  {
      const userRepository = getRepository(User);
      userRepository.merge(user, request.body);

      if (request.body.hasOwnProperty('region') === true &&
        list.includes(request.body.region) === true) {
        const reg = await getCustomRepository(RegionRepository).findByName(request.body.region);
        if (reg instanceof Region) {
          user.regions.push(reg);
        }
      }
      const res = await userRepository.save(user);
      responder(response, HttpCodes.successCreated, successResponse(SUCCESS.success201, [res]));
    } else {
      responderWrongId(response);
    }
  } catch (e) {
    response.status(HttpCodes.internalError).json(errorResponse(e));
  }
};
