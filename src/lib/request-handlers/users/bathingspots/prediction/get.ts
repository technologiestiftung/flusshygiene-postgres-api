import { BathingspotRepository } from './../../../../repositories/BathingspotRepository';
import { getSpotByUserAndId } from './../../../../repositories/custom-repo-helpers';
import { successResponse, responder, errorResponse } from './../../../responders';
import { HttpCodes, getResponse } from './../../../../types-interfaces';
import { getCustomRepository } from 'typeorm';
// import { getRepository } from 'typeorm';


export const getPredictions: getResponse = async (request, response) => {
  try {
    const userId = request.params.userId;
    const spotId = request.params.spotId;
    const spot = await getSpotByUserAndId(userId, spotId);
    if (spot === undefined) {
      throw new Error('Bathingspot does not exist');

    }
    // const spotWithRelation = await getBathingspotByIdWithRelations(spotId, ['predictions']);

    // https://github.com/typeorm/typeorm/blob/master/docs/relational-query-builder.md#working-with-relations

    const spotRepo = getCustomRepository(BathingspotRepository);

    // const spotWithRelation = await spotRepo.findOne(spotId, {relations:['predictions']});
    // console.log(spotWithRelation);
    // if(spotWithRelation === undefined ){

    // throw new Error('Could not load Bathingspot with relation "prediction"');
    // }else{

    //     const spotWithRelation = await spotRepo.createQueryBuilder('bathingspot')
    // .leftJoinAndSelect("bathingspot.predictions", "prediction")
    // .where("bathingspot.id = :id", { id: spotId })
    // .getOne();
    const spotWithPredictions = await spotRepo.getSpotWithPredictions(spotId);
    if (spotWithPredictions === undefined) {
      throw new Error(`The spot with id ${spotId} does not exist`);
    }
    responder(response,
      HttpCodes.successCreated,
      successResponse(`All predictions for spot ${spotId}`, spotWithPredictions.predictions));
    // }

  } catch (error) {
    responder(response, HttpCodes.internalError, errorResponse(error));

  }
}
