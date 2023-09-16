
import { CategoryArgs, CategoryCreateDTO, CategoryRemoveDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { PointCreateDTO, PointDeductDTO } from "@/dtos/point.dto";
import { PointRepository } from "@/repositories/point.repository";
import { Point, Points } from "@/typedefs/point.type";
import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PointResolver extends PointRepository{

  // @Authorized()
  @Query(() => Points, {
    description: 'List All Point History',
  })
  async listPointsHistory(@Args() paging: PagingArgs): Promise<Points> {
      const points: Points = await this.pointList(paging);
      return points;
  }

  // @Authorized()
  @Mutation(() => Point, {
    description: 'Add Point',
  })
  async addPoint(@Arg('pointData') pointData : PointCreateDTO): Promise<Point> {
    const point: Point = await this.pointAdd(pointData);
    return point;
  }

    // @Authorized()
    @Mutation(() => Point, {
      description: 'Deduct Point',
    })
    async subtractPoint(@Arg('pointData') pointData : PointDeductDTO): Promise<Point> {
      const point: Point = await this.deductPoint(pointData);
      return point;
    }

}
