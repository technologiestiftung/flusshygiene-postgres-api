import { BathingspotPrediction } from './../../../../../orm/entity/BathingspotPrediction';
// import { getSpotByUserAndId } from '../../../../repositories/custom-repo-helpers';
import { successResponse, responder, errorResponse, responderWrongId } from './../../../responders';
import { postResponse, HttpCodes } from './../../../../types-interfaces';
import { getRepository } from 'typeorm';
import { getSpot, getSpotWithRelation } from '../../../../repositories/repo-utils';
import { Bathingspot } from '../../../../../orm/entity/Bathingspot';


export const postPrediction: postResponse = async (request, response) => {
  try {
    const userId = request.params.userId;
    const spotId = request.params.spotId;
    const spot = await getSpot(userId, spotId);

    if (spot === undefined) {
      responderWrongId(response);
        } else {
      // https://github.com/typeorm/typeorm/blob/master/docs/relational-query-builder.md#working-with-relations
      const predictionRepo = getRepository(BathingspotPrediction);

      const prediction = predictionRepo.create();
      const mergedPrediction = predictionRepo.merge(prediction, request.body);
      const spotWithRelation = await getSpotWithRelation(spot.id, 'predictions');
      if (spotWithRelation === undefined) {
        throw new Error('Could not load Bathingspot with relation "prediction" even though it exists');
      } else {
        if (spotWithRelation.predictions === undefined) {
          spotWithRelation.predictions = [mergedPrediction];
        } else {
          spotWithRelation.predictions.push(mergedPrediction);
        }
        await predictionRepo.save(mergedPrediction);
        await getRepository(Bathingspot).save(spotWithRelation);
      }
      responder(response,
        HttpCodes.successCreated,
        successResponse('Prediction Posted', [mergedPrediction]));
    }
  } catch (error) {
    responder(response, HttpCodes.internalError, errorResponse(error));

  }
}
