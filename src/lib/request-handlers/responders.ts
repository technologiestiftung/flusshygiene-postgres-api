import { Response } from 'express';
import { Bathingspot } from '../../orm/entity/Bathingspot';
import { User } from '../../orm/entity/User';
import { ERRORS, SUGGESTIONS } from '../messages';
import { HttpCodes, IDefaultResponsePayload } from '../types-interfaces';

type Responder = (
  response: Response,
  statusCode: number,
  payload: IDefaultResponsePayload | User[] | Bathingspot[]) => void;

type SuccessResponder = (message?: string, data?: User | User[] | Bathingspot[]) => IDefaultResponsePayload;
export const userIDErrorResponse = () => {

  const res: IDefaultResponsePayload = {
    message: ERRORS.badRequestMissingOrWrongID404,
    success: false,
  };
  return res;
};
export const errorResponse: (error: Error) => IDefaultResponsePayload = (error) => {
  if (process.env.NODE_ENV === 'development') {
    throw error;
  }
  const res: IDefaultResponsePayload = {
    message: process.env.NODE_ENV === 'development' ? error.message : 'internal server error',
    success: false,
  };
  return res;
};
export const suggestionResponse: (message?: string, data?: object) => IDefaultResponsePayload = (message, data) => {
  const res: IDefaultResponsePayload = {
    data,
    message,
    success: false,
  };
  return res;
};

export const successResponse: SuccessResponder = (message, data) => {
  const res: IDefaultResponsePayload = {
    data,
    message,
    success: true,
  };
  return res;
};

export const responder: Responder = (response, statusCode, payload) => {
  response.status(statusCode).json(payload);
};
export const responderMissingBodyValue = (response: Response, example: object) => {
  return responder(response, HttpCodes.badRequestNotFound, suggestionResponse(SUGGESTIONS.missingFields, example));
};

export const responderSuccess = (response: Response, message: string) => {
  return responder(response, HttpCodes.success, successResponse(message));
};
export const responderSuccessCreated = (response: Response, message: string, data?: User) => {
  return responder(response, HttpCodes.successCreated, successResponse(message, data));
};
export const responderMissingId = (response: Response) => {
  return responder(response, HttpCodes.badRequest, userIDErrorResponse());
};
export const responderWrongId = (response: Response) => {
  return responder(response, HttpCodes.badRequestNotFound, userIDErrorResponse());
};
