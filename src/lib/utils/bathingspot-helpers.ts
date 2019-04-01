import { IObject } from '../types-interfaces';

import { Bathingspot } from '../../orm/entity/Bathingspot';

import { getCustomRepository } from 'typeorm';

import { BathingspotRepository } from '../repositories/BathingspotRepository';

import { isObject } from './is-object';

import { Region } from '../../orm/entity/Region';

import { RegionRepository } from '../repositories/RegionRepository';

const criteria = [
  { type: 'object', key: 'apiEndpoints' },
  { type: 'object', key: 'state' },
  { type: 'object', key: 'location' },
  { type: 'number', key: 'latitude' },
  { type: 'number', key: 'longitude' },
  { type: 'number', key: 'elevation' },
  { type: 'string', key: 'name' },
  { type: 'boolean', key: 'isPublic' },
  { type: 'boolean', key: 'isPublic' },
  { type: 'geometry', key: 'area' },
  { type: 'geometry', key: 'location' },
];

export const createSpotWithValues = async (providedValues: IObject): Promise<Bathingspot> => {
  const spotRepo = getCustomRepository(BathingspotRepository);
  const spot = new Bathingspot();

  criteria.forEach(criterion => {
    const value = providedValues[criterion.key];
    const obj = { [criterion.key]: value };
    switch (criterion.type) {
      case 'object':
        if (isObject(value)) {
          spotRepo.merge(spot, obj);
        }
        break;
      case 'geometry':
        if (isObject(value)) {
          const geom = { [criterion.key]: value.geometry };
          spotRepo.merge(spot, geom);
        }
        break;
      default:
        if (typeof value === criterion.type) {
          spotRepo.merge(spot, obj);
        }
        break;
    }
  });
  const region = await getAndVerifyRegion(providedValues);
  if (region instanceof Region) {
    spot.region = region;
  }
  return spot;
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
