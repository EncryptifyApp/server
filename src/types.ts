import { Request, Response } from "express";
import { SignUpState } from "./enums/SignUpState";

export interface Context {
  req: Request;
  res: Response;
  userId: string | null;
};

export type RegistrationPayload = { 
  countryCode: string,
  phoneNumber: string,
  registrationState: SignUpState
}