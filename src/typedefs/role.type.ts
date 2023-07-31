import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Role {

  @Field()
  id?: number;

  @Field()
  name?: string;

  @Field()
  description?: string;

  @Field()
  isDeleted?: boolean;

  @Field()
  isApproved?: boolean;

}
