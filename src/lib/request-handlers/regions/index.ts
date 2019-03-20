import { Region } from '../../../orm/entity/Region';
import { getResponse } from '../../types-interfaces';
import { errorResponse, responder } from '../responders';

export const getAllRegions: getResponse = async (_request, response) => {
  try {
    const regions: Region[] = [];
    responder(response, 200, regions);
  } catch (e) {
    errorResponse(e);
  }
};
