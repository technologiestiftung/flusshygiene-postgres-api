import { getRepository } from 'typeorm';
import { Region } from '../../../orm/entity/Region';
import { SUCCESS } from '../../messages';
import { HttpCodes, IObject, putResponse } from '../../types-interfaces';
import { isObject } from '../../utils';
import { errorResponse, responder, responderWrongId, successResponse } from '../responders';

const criteria = [
  {type: 'string', key: 'name'},
  {type: 'string', key: 'displayName'},
  {type: 'object', key: 'area'},
];
const createMergeObj: (obj: any) => IObject = (obj) => {
  const res: IObject = {};

  criteria.forEach((criterion) => {
    const value = obj[criterion.key];
    switch (criterion.type) {
      case 'object':
      if (isObject(value)) {
        res.area = value.geometry;
      }
      break;
      default:
      if (typeof value === criterion.type) {
        res[criterion.key] = value;
      }
    }
  });
  return res;
};

export const putRegion: putResponse = async (request, response) => {
  try {
    const regionRepo = getRepository(Region);
    const regionId = request.params.regionId;
    const region = await regionRepo.findOne(regionId);
    if (region === undefined) {
      responderWrongId(response);
    } else {
      const obj = createMergeObj(request.body);

      regionRepo.merge(region, obj);
      await regionRepo.save(region);
      responder(response, HttpCodes.successCreated, successResponse(SUCCESS.success201, [region]));
    }
  } catch (e) {
    response.status(HttpCodes.internalError).json(errorResponse(e));
  }
};
