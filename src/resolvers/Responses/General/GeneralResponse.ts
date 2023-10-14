import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./FieldError";

@ObjectType()
export class GeneralResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => Boolean, { nullable: true })
  success?: Boolean;
}