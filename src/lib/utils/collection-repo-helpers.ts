import { getRepository } from 'typeorm';
import {
  GenericInput,
  Rain,
  GlobalIrradiance,
  Discharge,
  BathingspotMeasurement,
  BathingspotPrediction,
  BathingspotModel,
  PurificationPlant,
} from '../../orm/entity';
import { IObject } from '../common';

export const collectionRepoMapping: IObject = {
  predictions: 'BathingspotPrediction',
  measurements: 'BathingspotMeasurement',
  purificationPlants: 'PurificationPlant',
  models: 'BathingspotModel',
  genericInputs: 'GenericInput',
  globalIrradiances: 'GlobalIrradiance',
  discharges: 'Discharge',
  rains: 'Rain',
};

export const getGIWithRelations: (
  itemId: string,
) => Promise<GenericInput | undefined> = async itemId => {
  try {
    const repo = getRepository(GenericInput);
    const query = repo
      .createQueryBuilder('generic_input')
      .leftJoinAndSelect('generic_input.measurements', 'measurements')
      .where('generic_input.id = :itemId', { itemId });
    const giWithRelation = await query.getOne();
    return giWithRelation;
  } catch (error) {
    throw error;
  }
};

export const getPPlantWithRelations: (
  itemId: string,
) => Promise<PurificationPlant | undefined> = async itemId => {
  try {
    const repo = getRepository(PurificationPlant);
    const query = repo
      .createQueryBuilder('gpurufication_plant')
      .leftJoinAndSelect('gpurufication_plant.measurements', 'measurements')
      .where('gpurufication_plant.id = :itemId', { itemId });
    const ppWithRelation = await query.getOne();
    return ppWithRelation;
  } catch (error) {
    throw error;
  }
};
export const getColletionItemById: (
  itemId: string,
  repoName: string,
) => Promise<
  | BathingspotPrediction
  | BathingspotMeasurement
  | BathingspotModel
  | PurificationPlant
  | GenericInput
  | Rain
  | GlobalIrradiance
  | Discharge
  | undefined
> = async (itemId: string, repoName: string) => {
  try {
    const repo = getRepository(repoName);
    // console.log(repo);

    const query = repo
      .createQueryBuilder(repoName)
      .where(`${repoName}.id = :itemId`, { itemId });

    const entity = await query.getOne();
    switch (repoName) {
      case 'BathingspotPrediction':
        return entity as BathingspotPrediction;
        break;
      case 'BathingspotMeasurement':
        return entity as BathingspotMeasurement;
        break;
      case 'BathingspotModel':
        return entity as BathingspotModel;
        break;
      case 'PurificationPlant':
        return entity as PurificationPlant;
        break;
      case 'GenericInput':
        return entity as GenericInput;
        break;
      case 'Rain':
        return entity as Rain;
        break;
      case 'GlobalIrradiance':
        return entity as GlobalIrradiance;
        break;
      case 'Discharge':
        return entity as Discharge;
        break;
      default:
        return undefined;
        break;
    }
  } catch (error) {
    throw error;
  }
};
