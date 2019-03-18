import { Bathingspot } from './../../../../orm/entity/Bathingspot';
import { postResponse, HttpCodes, IObject } from '../../../types-interfaces';
import { getRepository, getManager } from 'typeorm';
import { User } from '../../../../orm/entity/User';
import { responderWrongId, responderMissingBodyValue, responder, successResponse, errorResponse } from '../../responders';

import { isObject } from '../../../utils/is-object';
import { getEntityFields } from '../../../utils/get-entity-fields';
import { getMatchingValues } from '../../../utils/get-matching-values-from-request';

const updateFields = (spot: Bathingspot, providedValues: IObject): Bathingspot => {
  // curently silently fails needs some smarter way to set values on entities
  if (isObject(providedValues['apiEndpoints'])) {
    spot.apiEndpoints = providedValues['apiEndpoints'];// 'json' ]
  }// 'json' ]
  if (isObject(providedValues['state'])) {
    spot.state = providedValues['state'];// 'json' ]

  }// 'json' ]
  if (isObject(providedValues['location'])) {
    spot.location = providedValues['location'];// 'json' ]

  }// 'json' ]
  if (typeof providedValues['latitde'] === 'number') {
    spot.latitde = providedValues['latitde'];// 'float8' ]

  }// 'float8' ]
  if (typeof providedValues['longitude'] === 'number') {
    spot.longitude = providedValues['longitude'];// 'float8' ]

  }// 'float8' ]
  if (typeof providedValues['elevation'] === 'number') {
    spot.elevation = providedValues['elevation'];// 'float8' ]
  }// 'float8' ]
  return spot;
}
export const addBathingspotToUser: postResponse = async (request, response) => {
  try {
    const user = await getRepository(User).findOne(request.params.userId, { relations: ['bathingspots'] });
    if (user === undefined) {
      responderWrongId(response);
    } else {
      const example = getEntityFields('Bathingspot');

      if (request.body.hasOwnProperty('name') !== true) {

        responderMissingBodyValue(response, example);
      }

      if (request.body.hasOwnProperty('isPublic') !== true) {
        responderMissingBodyValue(response, example);
      }

      let spot = new Bathingspot();
      const filteredPropNames = await getEntityFields('Bathingspot');
      const providedValues = getMatchingValues(request.body, filteredPropNames.props);// Object.keys(request.body)
      try {
        spot = updateFields(spot, providedValues);
      } catch (err) {
        throw err;
      }

      const isPublic: boolean = request.body.isPublic;
      const name: string = request.body.name;
      spot.name = name;
      spot.isPublic = isPublic;
      user.bathingspots.push(spot);
      await getManager().save(spot);
      await getManager().save(user);
      const userAgain = await getRepository(User).findOne(request.params.userId, { relations: ['bathingspots'] });
      if (userAgain !== undefined) {
        responder(response, HttpCodes.successCreated, successResponse('Bathingspot created', [userAgain.bathingspots[userAgain.bathingspots.length - 1]]))
      } else {
        throw Error('user id did change user does not exist anymore should never happen');
      }
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
}
