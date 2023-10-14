import { Field, ObjectType} from "type-graphql";
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn} from "typeorm";

@ObjectType()
@Entity()
export class VerificationCode extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column()
    countryCode: string;

    @Field(() => String)
    @Column()
    phoneNumber: string;

    @Field(() => String)
    @Column()
    code: string;

    @Field(() => Date, { nullable: true })
    @Column()
    expiresAt: Date = new Date();

    @Field(() => Date, { nullable: true })
    @Column()
    createdAt: Date = new Date();

    @Field(() => Date, { nullable: true })
    @Column()
    updatedAt: Date = new Date();
}