import { CategoryArgs, CategoryCreateDTO, CategoryRemoveDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { PointCreateDTO, PointDeductDTO } from "@/dtos/point.dto";
import { CategoryEntity, Status } from "@/entities/category.entity";
import { PointEntity } from "@/entities/points.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Categories, Category } from "@/interfaces/category.interface";
import { Point, Points } from "@/interfaces/point.interface";
import { EntityRepository, In, LessThan, MoreThan, UpdateResult } from "typeorm";

@EntityRepository(CategoryEntity)
export class PointRepository{

  public async pointList(paging: PagingArgs ): Promise<Points> {

    // const findCategories : [CategoryEntity[], number] = await CategoryEntity.findAndCount(
    //   {
    //     select: ["id", "name", "slug", "description", "banner",
    //       "status", "isFeatured", "isSponsored", "isGlobal", "parentCategory"],
    //     relations: ['parentCategory'],
    //     where:where,
    //     take: limit
    //   }
    // );

    let sql = PointEntity.createQueryBuilder("pe")
                    .select(["pe.id", "pe.amount", "pe.type", "pe.expireAt",
                             "pe.isBlocked", "pe.consumed", "pe.description",
                             "pe.isPlus", "pe.dateCreated",  "pe.dateUpdated"])
                    .leftJoinAndSelect('pe.user', 'user')
                    .orderBy('pe.expireAt', 'ASC')

    if (paging.starting_after){
      sql = sql.where("pe.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.where("pe.id < :ending_before", {ending_before: paging.ending_before} )
    }

    // console.log("Query", sql.getSql())
    // const analyze =await CategoryEntity.query(`EXPLAIN (FORMAT json) ${sql.getSql()}`)
    // const count = analyze[0]["QUERY PLAN"][0]["Plan"]["Plan Rows"]
    // const count = analyze[0].['QUERY PLAN'][0]
    // console.log("Count", count)
    const limit:number = Math.min(1000, paging.limit?paging.limit: 100)
    sql = sql.limit(limit)

    const findPointHistory = await sql.getManyAndCount()

    const pointHistoryList = findPointHistory[0]
    // const categoryTree: Category[] =  getCategoryTree(pointHistoryList, null)

    const hasMore = pointHistoryList.length === limit;

    // const prevCursor = paging.starting_after? paging.starting_after: paging.ending_before? paging.ending_before: null
    // const nextCursor = categoryList[categoryList.length -1].id

    return {items: pointHistoryList, hasMore: hasMore}

  }

  public async pointBalanceQuery(userId: number): Promise<number> {
    let currentBalance: number = 0;

    const points = await PointEntity.createQueryBuilder('pe')
    .select(['pe.isPlus', 'pe.id', 'pe.amount', 'pe.expireAt', 'pe.isBlocked', 'pe.consumed'])
    .leftJoinAndSelect('pe.user', 'user')
    // .leftJoinAndSelect('cm.community', 'community')
    .where('pe.userId = :userId', { userId: userId })
    .andWhere('pe.isPlus = true')
    .andWhere('pe.expireAt >= :nowTime', {nowTime: new Date()} )
    .orderBy('pe.expireAt', 'ASC')
    .getMany();

    if (points.length === 0) return currentBalance;
    let consumed:number = 0;
    let total:number = 0
    points.forEach(point => {
      consumed += point.consumed;
      total += point.amount
    })

    currentBalance = total - consumed;
    return currentBalance;
  }

  public async pointBalanceQueries(userIds: number[]): Promise<object> {
    const points = await PointEntity.createQueryBuilder('pe')
    .select(['pe.isPlus', 'pe.id', 'pe.amount', 'pe.expireAt', 'pe.isBlocked', 'pe.consumed'])
    .leftJoinAndSelect('pe.user', 'user')
    // .leftJoinAndSelect('cm.community', 'community')
    .where('pe.userId IN (:...userIds)', { userIds: userIds })
    .andWhere('pe.isPlus = true')
    .andWhere('pe.expireAt >= :nowTime', {nowTime: new Date()} )
    .orderBy('pe.expireAt', 'ASC')
    .getMany();

    let balances = {}
    points.forEach(point => {
      balances[point.user.id]
          ? balances[point.user.id] +=  point.amount -  point.consumed
          : balances[point.user.id] =  point.amount -  point.consumed
    })
    return balances

  }

  public async pointAdd(pointData: PointCreateDTO): Promise<Point>{
    const findUser: UserEntity = await UserEntity.findOne({where: {id: pointData.userId}})
    if (!findUser) throw new HttpException(409, `User with id ${pointData.userId} doesn't exists`);

    const days: number = pointData.validity? pointData.validity : 30; //default is 30
    const expiry = new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000)

    const createPointData: PointEntity = await PointEntity.create({...pointData, user:findUser, expireAt: expiry}).save();
    return createPointData;
  }

  public async deductPoint(pointData:PointDeductDTO):Promise<Point>{
      const points = await PointEntity.createQueryBuilder('pe')
            .select(['pe.isPlus', 'pe.id', 'pe.amount', 'pe.expireAt', 'pe.isBlocked', 'pe.consumed'])
            .leftJoinAndSelect('pe.user', 'user')
            // .leftJoinAndSelect('cm.community', 'community')
            .where('pe.userId = :userId', { userId: pointData.userId })
            .andWhere('pe.isPlus = true')
            .andWhere('pe.expireAt >= :nowTime', {nowTime: new Date()} )
            .orderBy('pe.expireAt', 'ASC')
            .getMany();
    const amountToDeduct = pointData.amount;
    if (points.length === 0) throw new HttpException(409, `Not enough point`);
    console.log(points)
    const user: UserEntity = points[0].user;
    let consumed:number = 0;
    let total:number = 0
    points.forEach(point => {
      consumed += point.consumed;
      total += point.amount
    })

    const totalAvailable = total - consumed;
    if (totalAvailable < amountToDeduct) throw new HttpException(409, `Insufficient Balance`);

    let deducted = 0;
    let idx = 0;
    while (deducted < amountToDeduct){
      const nowPoint = points[idx]
      const yetToConsume = nowPoint.amount - nowPoint.consumed;

      if (yetToConsume > 0){
        //update the consume and deduct
        const toBeDeducted = amountToDeduct - deducted < yetToConsume ? amountToDeduct - deducted : yetToConsume
        deducted += toBeDeducted
        points[idx].consumed += toBeDeducted //revisit the query
      }
      idx += 1;
    }

    await PointEntity.save(points)

    //create the spend entry
    const pointDeducted = await PointEntity.create({
      amount: amountToDeduct,
      isPlus: false,
      description: pointData.description,
      user,
      expireAt: new Date()
    }).save()

    return pointDeducted

  }

}
