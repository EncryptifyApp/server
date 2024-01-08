import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./General/FieldError";

@ObjectType()
export class  TokenResponse {
    @Field(() => FieldError, { nullable: true })
    error?: FieldError;

    @Field(() => String ,{ nullable: true})
    token?: string;
}