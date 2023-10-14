import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./General/FieldError";
import { User } from "../../entities/User";


@ObjectType()
export class  SignUpResponse {
    @Field(() => FieldError, { nullable: true })
    error?: FieldError;

    @Field(() => User)
    user?: User;
}