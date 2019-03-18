import { responderMissingBodyValue, responder, errorResponse, responderWrongId, successResponse } from './../../responders';
import { putResponse, HttpCodes } from '../../../types-interfaces';
import { getEntityFields } from '../../../utils/get-entity-fields';
import { getRepository, getManager } from 'typeorm';
import { User } from '../../../../orm/entity/User';
import { Bathingspot } from '../../../../orm/entity/Bathingspot';
import { getMatchingValues } from '../../../utils/get-matching-values-from-request';
import { isObject } from 'util';

export const updateBathingspotOfUser: putResponse = async (request, response) => {
  try {
    const example = await getEntityFields('Bathingspot');
    const user: User | undefined = await getRepository(User).findOne(request.params.userId, { relations: ['bathingspots'] });

    if (user === undefined) {
      responderWrongId(response);
    } else {
      const spots: Bathingspot[] = user.bathingspots.filter((spot: Bathingspot) => {
        if (spot.id === parseInt(request.params.spotId, 10)) {
          return spot;
        }
        return;
      });
      if (spots[0] === undefined) {
        responderWrongId(response);
      } else {
        const spot = spots[0];
        const filteredPropNames = await getEntityFields('Bathingspot');
        const providedValues = getMatchingValues(request.body, filteredPropNames.props);// Object.keys(request.body)
        // console.log(providedValues);
        if(Object.keys(providedValues).length === 0){
        responderMissingBodyValue(response, example);

        }
        try {
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
          if (typeof providedValues['isPublic'] === 'boolean') {
            spot.isPublic = providedValues['isPublic'];
          }
          if (typeof providedValues['name'] === 'string') {
            spot.name = providedValues['name'];
          }
        } catch (err) {
          throw err;
        }
        await getManager().save(spot);
        await getManager().save(user);
        const spotAgain = await getRepository(Bathingspot).findOne(request.params.spotId);
        if (spotAgain === undefined) {
          responder(response, HttpCodes.internalError, errorResponse(new Error('Bathingspot is gone')));
        } else {
          responder(response, HttpCodes.successCreated, successResponse('Bathingspot updated', [spotAgain]));
        }
      }
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
  // throw new Error(`not yet implemented req ${request}, ${response}`);
};

