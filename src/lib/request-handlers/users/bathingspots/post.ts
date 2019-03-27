import { getCustomRepository, getManager } from 'typeorm';
import { Region } from '../../../../orm/entity/Region';
import { User } from '../../../../orm/entity/User';
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
import { getRegionsList } from './../../../repositories/custom-repo-helpers';

const createSpotWithValues = async (providedValues: IObject): Promise<Bathingspot> => {
  try {
  const spot = new Bathingspot();
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
  if (typeof providedValues.name === 'string') {
    spot.name = providedValues.name;
  }
  if (typeof providedValues.isPublic === 'boolean') {
    spot.isPublic = providedValues.isPublic;
  }
  const region = await getAndVerifyRegion(providedValues);
  if (region instanceof Region) {
      spot.region = region;
  }
  return spot;
} catch (error) {
    throw error;
}
};

const getAndVerifyRegion = async (obj: any) => {
  const regionRepo = getCustomRepository(RegionRepository);
  try {
    let region: Region | undefined;
    if (obj.hasOwnProperty('region') === true) {
      region = await regionRepo.findByName(obj.region);
      if (region instanceof Region) {
        return region;
      }
    }
    return region;
  } catch (error) {
    throw error;
  }
};

export const addBathingspotToUser: postResponse = async (request, response) => {
  try {
    const list = await getRegionsList();
    const filteredPropNames = await getEntityFields('Bathingspot');
    const user = await getUserWithRelations(request.params.userId, ['bathingspots']);
    if (request.body.hasOwnProperty('name') === true && request.body.hasOwnProperty('isPublic') === true) {

      if (user instanceof User && user.role !== UserRole.reporter) {
        const providedValues = getMatchingValues(request.body, filteredPropNames.props);

        const spot = await createSpotWithValues(providedValues);
        if (spot.isPublic === true &&
          (providedValues.hasOwnProperty('region') === false ||
            list.includes(request.body.region) === false)
          ) {
          const regionsExample = list;
          responderMissingBodyValue(response, {
            'possible-regions': regionsExample,
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
    } else {
      responderMissingBodyValue(response, filteredPropNames);
    }
  } catch (e) {
    responder(response, HttpCodes.internalError, errorResponse(e));
  }
};
