import { Field, ObjectType} from "type-graphql";
import { Column, Entity, BaseEntity, PrimaryColumn} from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryColumn()
    id: string;

    @Field(() => String)
    @Column()
    username: string;

    @Field(() => String)
    @Column({nullable:true})
    profileUrl: string;

    @Field(() => String)
    @Column()
    countryCode: string;

    @Field(() => String)
    @Column()
    phoneNumber: string;

    @Field(() => String)
    @Column()
    deviceId: string;

    @Field(() => Date, { nullable: true })
    @Column()
    createdAt: Date = new Date();

    @Field(() => Date, { nullable: true })
    @Column()
    updatedAt: Date = new Date();
}