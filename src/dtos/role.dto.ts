import { IsString, IsNotEmpty } from "class-validator";
import { InputType, Field } from "type-graphql";


@InputType()
export class CreateRoleDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({nullable: true})
  description?: string;

  @Field({nullable: true})
  isDeleted?: boolean;

  @Field({nullable: true})
  isApproved?: boolean;
}

@InputType()
export class UpdateRoleDTO {
  @Field()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field({nullable: true})
  description?: string;

  @Field({nullable: true})
  isDeleted?: boolean;

  @Field({nullable: true})
  isApproved?: boolean;
}
