import { getCustomRepository, getManager } from 'typeorm';
import { Region } from '../../../../orm/entity/Region';
import { User } from '../../../../orm/entity/User';
import { getUserWithRelations } from '../../../repositories/custom-repo-helpers';
import { RegionRepository } from '../../../repositories/RegionRepository';
import { HttpCodes, IObject, postResponse, UserRole } from '../../../types-interfaces';
import { getEntityFields, getMatchingValues, isObject } from '../../../utils';
// import { getPropsValueGeneric } from '../../../utils/get-properties-values-generic';
import {
  errorResponse,
  responder,
  responderMissingBodyValue,
  responderNotAuthorized,
  responderWrongId,
  successResponse,
} from '../../responders';
import { getRegionsList } from './../../../repositories/custom-repo-helpers';
import { createSpotWithValues } from './../../../utils/bathingspot-helpers';

// const verifyPublic: (obj: any) => boolean = (obj) => {
//   let res = false;
//   const hasName = getPropsValueGeneric<string>(obj, 'name');
//   const isPublic = getPropsValueGeneric<boolean>(obj, 'isPublic');
//   if (hasName !== undefined && isPublic === true) {
//     res = true;
//   }
//   return res;
// };

export const addBathingspotToUser: postResponse = async (request, response) => {
  try {
    const list = await getRegionsList();
    const filteredPropNames = await getEntityFields('Bathingspot');
    const user = await getUserWithRelations(request.params.userId, ['bathingspots']);

    // if (verifyPublic(request.body)) {
    if (user instanceof User && user.role !== UserRole.reporter) {
      const providedValues = getMatchingValues(request.body, filteredPropNames.props);

      const spot = await createSpotWithValues(providedValues);
      if (spot.isPublic === true &&
        (providedValues.hasOwnProperty('region') === false ||
          list.includes(request.body.region) === false)
      ) {
        responderMissingBodyValue(response, {
          'possible-regions': list,
          'problem': 'when isPublic is set to true you need to set a region',
        });
      } else {
        user.bathingspots.push(spot);
        const res = await getManager().save(user);
        responder(response,
          HttpCodes.successCreated,
          successResponse('Bathingspot created', [res]));
      }
    } else if (user instanceof User && user.role === UserRole.reporter) {
      responderNotAuthorized(response);
    } else {
      responderWrongId(response);
    }
    // } else {
    //   responderMissingBodyValue(response, filteredPropNames);
    // }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};
