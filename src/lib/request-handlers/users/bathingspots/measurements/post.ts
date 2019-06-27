
// import { getSpotByUserAndId } from '../../../../repositories/custom-repo-helpers';
import { successResponse, responder, errorResponse, responderWrongId } from './../../../responders';
import { postResponse, HttpCodes } from './../../../../types-interfaces';
import { getRepository } from 'typeorm';
import { getSpot, getSpotWithRelation } from '../../../../repositories/repo-utils';
import { Bathingspot } from '../../../../../orm/entity/Bathingspot';
import { BathingspotMeasurement } from '../../../../../orm/entity/BathingspotMeasurement';


export const postMeasurements: postResponse = async (request, response) => {
  try {
    const userId = request.params.userId;
    const spotId = request.params.spotId;
    const spot = await getSpot(userId, spotId);

    if (spot === undefined) {
      responderWrongId(response);
        } else {
      // https://github.com/typeorm/typeorm/blob/master/docs/relational-query-builder.md#working-with-relations
      const mesRepo = getRepository(BathingspotMeasurement);

      const mes = mesRepo.create();
      const mergedMes = mesRepo.merge(mes, request.body);
      const spotWithRelation = await getSpotWithRelation(spot.id, 'measurements');
      if (spotWithRelation === undefined) {
        throw new Error('Could not load Bathingspot with relation "Measurements" even though it exists');
      } else {
        if (spotWithRelation.measurements === undefined) {
          spotWithRelation.measurements = [mergedMes];
        } else {
          spotWithRelation.measurements.push(mergedMes);
        }
        await mesRepo.save(mergedMes);
        await getRepository(Bathingspot).save(spotWithRelation);
      }
      responder(response,
        HttpCodes.successCreated,
        successResponse('Measurements Posted', [mergedMes]));
    }
  } catch (error) {
    responder(response, HttpCodes.internalError, errorResponse(error));

  }
}
