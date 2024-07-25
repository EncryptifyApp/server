import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./FieldError";
import { User } from "../../entities/User";

@ObjectType()
export class AuthenticationUserResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Date, { nullable: true })
  subscriptionEndDate?: Date;
}