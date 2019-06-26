import { BathingspotRepository } from './../../../../repositories/BathingspotRepository';
import { BathingspotPrediction } from './../../../../../orm/entity/BathingspotPrediction';
import { getSpotByUserAndId } from './../../../../repositories/custom-repo-helpers';
import { successResponse, responder, errorResponse } from './../../../responders';
import { postResponse, HttpCodes } from './../../../../types-interfaces';
import { getRepository, getCustomRepository } from 'typeorm';


export const postPrediction: postResponse = async (request, response) => {
  try {
    const userId = request.params.userId;
    const spotId = request.params.spotId;
    const spot = await getSpotByUserAndId(userId, spotId);
    // console.log(spot);
    if (spot !== undefined) {
      // const spotWithRelation = await getBathingspotByIdWithRelations(spotId, ['predictions']);

      // https://github.com/typeorm/typeorm/blob/master/docs/relational-query-builder.md#working-with-relations
      const predictionRepo = getRepository(BathingspotPrediction);

      const prediction = predictionRepo.create();
      const mergedPrediction = predictionRepo.merge(prediction, request.body);
      // console.log(mergedPrediction);
      const spotRepo = getCustomRepository(BathingspotRepository);
      const spotWithRelation = await spotRepo.getSpotWithPredictions(spotId);
      if(spotWithRelation !== undefined ){
        if(spotWithRelation.predictions !== undefined){
          spotWithRelation.predictions.push(mergedPrediction);
        }else{
          spotWithRelation.predictions = [mergedPrediction];
        }
        await predictionRepo.save(mergedPrediction);
        await spotRepo.save(spotWithRelation);
      }else{
        throw new Error('Could not load Bathingspot with relation "prediction"');
      }
      responder(response,
        HttpCodes.successCreated,
        successResponse('Prediction Posted', [mergedPrediction]));
    }else{
      throw new Error('Bathingspot does not exist');
    }
  } catch (error) {
    responder(response, HttpCodes.internalError, errorResponse(error));

  }
}
