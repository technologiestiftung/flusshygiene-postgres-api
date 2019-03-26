import { getCustomRepository, getManager } from 'typeorm';
import { getUserWithRelations } from '../../../repositories/custom-repo-helpers';
import { RegionRepository } from '../../../repositories/RegionRepository';
import { HttpCodes, IObject, postResponse, UserRole } from '../../../types-interfaces';
import { getEntityFields, getMatchingValues, isObject } from '../../../utils';
import {
  errorResponse,
  responder,
  responderMissingBodyValue,
  responderNotAuthorized,
  responderWrongId,
  successResponse,
} from '../../responders';
import { Bathingspot } from './../../../../orm/entity/Bathingspot';

const updateFields = (spot: Bathingspot, providedValues: IObject): Bathingspot => {
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
  return spot;
};
export const addBathingspotToUser: postResponse = async (request, response) => {

  try {
    const regionRepo = getCustomRepository(RegionRepository);
    let list = await regionRepo.getNamesList();
    list = list.map(obj => obj.name);
    const example = await getEntityFields('Bathingspot');
    if (request.body.hasOwnProperty('name') !== true || request.body.hasOwnProperty('isPublic') !== true) {
      responderMissingBodyValue(response, example);
    }
    const user = await getUserWithRelations(request.params.userId, ['bathingspots']);
    if (user === undefined) {
      responderWrongId(response);
    } else {
      if (user.role === UserRole.reporter) {
        responderNotAuthorized(response);
      } else {

        let spot = new Bathingspot();
        const filteredPropNames = await getEntityFields('Bathingspot');
        const providedValues = getMatchingValues(request.body, filteredPropNames.props);
        if (providedValues.hasOwnProperty('region') === true) {

          const region = await regionRepo.findByName(providedValues.region).catch((err) => {
            if (process.env.NODE_ENV === 'development') {
              process.stderr.write(`${JSON.stringify(err)}\n`);
            }
          });
          if (region !== undefined) {
            spot.region = region;
          }
      }
        spot = updateFields(spot, providedValues);
        const isPublic: boolean = request.body.isPublic;
        const name: string = request.body.name;
        spot.name = name;
        spot.isPublic = isPublic;
        if (isPublic === true &&
          (providedValues.hasOwnProperty('region') === false ||
           list.includes(request.body.region) === false)) {
          const regionsExample = list;
          responderMissingBodyValue(response, {
            'possible-regions': regionsExample,
            'problem': 'when isPublic is set to true you need to set a region',
        });
        } else {

          user.bathingspots.push(spot);
          await getManager().save(user);
          const userAgain = await getUserWithRelations(request.params.userId, ['bathingspots']);
          if (userAgain === undefined) {
            throw Error('user id did change user does not exist anymore should never happen');
          }
          responder(response,
            HttpCodes.successCreated,
            successResponse('Bathingspot created', [userAgain.bathingspots[userAgain.bathingspots.length - 1]]));
          }
        }
      }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};
