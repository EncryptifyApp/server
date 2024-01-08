import { registerEnumType } from "type-graphql";

export enum SignUpState {
    PHONE_NUMBER_PROVIDED = "PHONE_NUMBER_PROVIDED",
   PHONE_NUMBER_VERIFIED =  "PHONE_NUMBER_VERIFIED", 
}

registerEnumType(SignUpState, {
    name: "SignUpState",
    description: "The state of the user's registration process",
});