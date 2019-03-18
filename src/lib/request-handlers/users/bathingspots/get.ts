import { Bathingspot } from './../../../../orm/entity/Bathingspot';
import { getResponse, HttpCodes } from '../../../types-interfaces';
import { User } from '../../../../orm/entity/User';
import { getRepository } from 'typeorm';
import { responderWrongId, responder, successResponse, errorResponse } from '../../responders';

/**
 * Gets all the bathingspots of the user
 * @param request
 * @param response
 */
export const getUserBathingspots: getResponse = async (request, response) => {
  try {
    const user: User | undefined = await getRepository(User).findOne(request.params.userId, { relations: ['bathingspots'] });
    if (user === undefined) {
      // throw new Error('user undefined or 0');
      responderWrongId(response);
    } else {
      responder(response, HttpCodes.success, successResponse('all bathingspots', user.bathingspots));
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
}



/**
 * Gets single bathingspot of user by id
 * @param request
 * @param response
 */
export const getOneUserBathingspotById: getResponse = async (request, response) => {
  try {
    const user: User | undefined = await getRepository(User).findOne(request.params.userId, { relations: ['bathingspots'] });
    if (user === undefined) {
      // throw new Error('user undefined or 0');
      responderWrongId(response);
    } else {
      const spots: Bathingspot[] = user.bathingspots.filter(spot => spot.id === parseInt(request.params.spotId, 10));
      if (spots.length > 0) {
        responder(response, HttpCodes.success, [spots[0]]);
      } else {
        responderWrongId(response);
      }
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
}

