//this middleware ensures that the user doesnt skip any sign up process
// Middleware to verify the token and user's state
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types";
import jwt from "jsonwebtoken";

export const CheckSignUpState: MiddlewareFn<Context> = async ({ context }, next) => {
  const token = context.req.headers.authorization;

  if (!token) {
    throw new Error("Token is missing.");
  }

  try {
    const decoded = jwt.verify(token, "yourSecretKey"); // Verify the token using your secret key
    const { phoneNumber, signUpState } = decoded;

    if (signUpState !== "ProfileInfoProvided") {
      throw new Error("You must complete the previous steps.");
    }

    // Proceed to the resolver
    return next();
  } catch (error) {
    throw new Error("Token is invalid.");
  }
};
