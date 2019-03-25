import { getCustomRepository } from 'typeorm';
import { isObject } from 'util';
import { Bathingspot } from '../../../../orm/entity/Bathingspot';
import { RegionRepository } from '../../../repositories/RegionRepository';
import { UserRepository } from '../../../repositories/UserRepository';
import { HttpCodes, IObject, putResponse } from '../../../types-interfaces';
import { getEntityFields } from '../../../utils/get-entity-fields';
import { getMatchingValues } from '../../../utils/get-matching-values-from-request';
import { BathingspotRepository } from './../../../repositories/BathingspotRepository';
import { getBathingspotById, getSpotByUserAndId } from './../../../repositories/custom-repo-helpers';
import { errorResponse, responder,
  responderMissingBodyValue,
  responderWrongId,
  successResponse } from './../../responders';

const updateFields = (spot: Bathingspot, providedValues: IObject) => {
  // curently silently fails needs some smarter way to set values on entities
  if (isObject(providedValues.apiEndpoints)) {
    spot.apiEndpoints = providedValues.apiEndpoints; // 'json' ]
  }// 'json' ]
  if (isObject(providedValues.state)) {
    spot.state = providedValues.state; // 'json' ]

  }// 'json' ]
  if (isObject(providedValues.location)) {
    spot.location = providedValues.location; // 'json' ]

  }// 'json' ]
  if (typeof providedValues.latitude === 'number') {
    spot.latitude = providedValues.latitude; // 'float8' ]

  }// 'float8' ]
  if (typeof providedValues.longitude === 'number') {
    spot.longitude = providedValues.longitude; // 'float8' ]

  }// 'float8' ]
  if (typeof providedValues.elevation === 'number') {
    spot.elevation = providedValues.elevation; // 'float8' ]
  }// 'float8' ]
  if (typeof providedValues.isPublic === 'boolean') {
    spot.isPublic = providedValues.isPublic;
  }
  if (typeof providedValues.name === 'string') {
    spot.name = providedValues.name;
  }
  return spot;
};

export const updateBathingspotOfUser: putResponse = async (request, response) => {
  const spotRepo = getCustomRepository(BathingspotRepository);
  const userRepo = getCustomRepository(UserRepository);
  const regionRepo = getCustomRepository(RegionRepository);
  try {
    const example = await getEntityFields('Bathingspot');

    let spotFromUser = await getSpotByUserAndId(request.params.userId, request.params.spotId);
    const relatedUsers = await userRepo.findUserBySpotId(request.params.spotId);
    const filteredRelatedUsers = relatedUsers.filter(user => user.id === parseInt(request.params.userId, 10));
    if (filteredRelatedUsers.length === 0) {
      throw new Error('What where is the user?');
    }
    if (spotFromUser === undefined) {
      responderWrongId(response);
    } else {
      const filteredPropNames = await getEntityFields('Bathingspot');
      const providedValues = getMatchingValues(request.body, filteredPropNames.props);
      if (Object.keys(providedValues).length === 0) {
        responderMissingBodyValue(response, example);
      }
      if (providedValues.hasOwnProperty('region') === true) {

          const region = await regionRepo.findByName(providedValues.region).catch((err) => {
            if (process.env.NODE_ENV === 'development') {
              process.stderr.write(`${JSON.stringify(err)}\n`);
            }
          });
          if (region !== undefined) {
            spotFromUser.region = region;
          }
      }
      spotFromUser = updateFields(spotFromUser, providedValues);
      await spotRepo.save(spotFromUser);
      const spotAgain = await getBathingspotById(spotFromUser.id);
      if (spotAgain === undefined) {
        throw new Error('spot disappeared');
      }
      // const res = spotAgain === undefined ? [] : [spotAgain];
      responder(response, HttpCodes.successCreated, successResponse('Bathingspot updated', [spotAgain]));
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
  // throw new Error(`not yet implemented req ${request}, ${response}`);
};
