import { getSpotByUserAndId, getUserWithRelations } from '../../../repositories/custom-repo-helpers';
import { getResponse, HttpCodes } from '../../../types-interfaces';
import { errorResponse, responder, responderWrongId, successResponse } from '../../responders';
/**
 * Gets all the bathingspots of the user
 * @param request
 * @param response
 */

export const getUserBathingspots: getResponse = async (request, response) => {
  try {

    const user = await getUserWithRelations(request.params.userId, ['bathingspots']);

    if (user === undefined) {
      responderWrongId(response);
    } else {
      responder(response, HttpCodes.success, successResponse('all bathingspots', user.bathingspots));
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};

/**
 * Gets single bathingspot of user by id
 * @param request
 * @param response
 */
export const getOneUserBathingspotById: getResponse = async (request, response) => {
  try {
    const spotFromUser = await getSpotByUserAndId(request.params.userId, request.params.spotId);
    if (spotFromUser === undefined) {
      responderWrongId(response);
    } else {
      responder(response, HttpCodes.success, [spotFromUser]);
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};

