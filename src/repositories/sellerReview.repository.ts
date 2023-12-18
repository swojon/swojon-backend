import { PagingArgs } from "@/dtos/category.dto";
import { ReviewCreateDTO, ReviewFilterInput, ReviewUpdateDTO, SellerReviewCreateDTO } from "@/dtos/sellerReview.dto";
import { ListingEntity } from "@/entities/listing.entity";
import { SellerReviewEntity } from "@/entities/sellerReview.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Review } from "@/interfaces/sellerReview.interface";
import { Reviews, SummaryReview } from "@/typedefs/sellerReview.type";
import { EntityRepository } from "typeorm";


@EntityRepository(SellerReviewEntity)
export class SellerReviewRepository{

  public async sellerReviewAdd(reviewData: SellerReviewCreateDTO): Promise<Review>{
    const findReviewer:UserEntity = await UserEntity.findOne({where:{id:reviewData.reviewerId}})
    if (!findReviewer) throw new HttpException(409, "User doesn't exist")
    let findListing = null;
    let findSellerId = null;

    if(reviewData.listingId ){
      findListing = await ListingEntity.findOne({where: {id:reviewData.listingId}, relations:["user"]})
      if (!findListing) throw new HttpException(409, "Listing doesn't exist");
      findSellerId  = findListing.user;
    }else if (reviewData.sellerId ){
      findSellerId = reviewData.sellerId
    }else {
      throw new HttpException(409, "Either Seller Id or Listing Id Must be provided. ")
    }
    
    const createReviewData:SellerReviewEntity= await SellerReviewEntity.create(
                    {...reviewData, sellerId:findSellerId, reviewer:findReviewer, listing:findListing}
                    ).save()
    
    const createdData:Review = await SellerReviewEntity.findOne({where: {id:createReviewData.id}, relations:["reviewer", 'seller', 'listing']})
    return createdData;
  }

  public async listingReviewAdd(reviewData:ReviewCreateDTO): Promise<Review>{

    const findReviewer:UserEntity = await UserEntity.findOne({where:{id:reviewData.reviewerId}})
    if (!findReviewer) throw new HttpException(409, "User doesn't exist")

    const findListing:ListingEntity = await ListingEntity.findOne({where: {id:reviewData.listingId}, relations:["user"]})
    if (!findListing) throw new HttpException(409, "Listing doesn't exist");

    const findSeller:UserEntity = findListing.user;
    const createReviewData:SellerReviewEntity= await SellerReviewEntity.create(
                    {...reviewData, seller:findSeller, reviewer:findReviewer, listing:findListing}
                    ).save()

    const createdData:Review = await SellerReviewEntity.findOne({where: {id:createReviewData.id}, relations:["reviewer", 'seller', 'listing']})
    return createdData;
  }

  public async listingReviewUpdate(reviewId:number, reviewData:ReviewUpdateDTO): Promise<Review>{
    const findReview:SellerReviewEntity = await SellerReviewEntity.findOne({where:{id:reviewId}})
    if (!findReview) throw new HttpException(409, `Review with id ${reviewId} doesn't exist`);

    if (reviewData.rating) findReview.rating = reviewData.rating;
    if (reviewData.review) findReview.review = reviewData.review;

    const updatedReview:Review = await SellerReviewEntity.save(findReview)
    return updatedReview
  }

  public async listingReviewRemove(reviewId:number):Promise<Review>{
    const findReview:SellerReviewEntity = await SellerReviewEntity.findOne({where:{id:reviewId}})
    if (!findReview) throw new HttpException(409, `Review with id ${reviewId} doesn't exist`);

    findReview.isDeleted = true
    const updatedReview:Review = await SellerReviewEntity.save(findReview)
    return updatedReview
  }

  public async listingReviewList(listingId: number): Promise<Reviews>{

    const review:[SellerReviewEntity[], number] = await SellerReviewEntity
                  .createQueryBuilder("seller_review_entity")
                  .select(["seller_review_entity.id","seller_review_entity.dateCreated",  "seller_review_entity.isDeleted", "seller_review_entity.review", "seller_review_entity.rating",  "seller_review_entity.listingId"])
                  .leftJoinAndSelect('seller_review_entity.reviewer', 'reviewer')
                  .leftJoinAndSelect('seller_review_entity.seller', 'seller')
                  .where("seller_review_entity.listingId = :id", { id: listingId })
                  .getManyAndCount()

    const reviews: Reviews = {
      count: review[1],
      items: review[0]
    }

    return reviews;
  }

  public async sellerReviewList(userId: number, paging:PagingArgs, filters: ReviewFilterInput): Promise<Reviews>{

    // const review:[SellerReviewEntity[], number] = await 
    let sql = SellerReviewEntity
                  .createQueryBuilder("seller_review_entity")
                  .select(["seller_review_entity.id","seller_review_entity.dateCreated",  "seller_review_entity.isDeleted", "seller_review_entity.review", "seller_review_entity.rating"])
                  .leftJoinAndSelect('seller_review_entity.reviewer', 'reviewer')
                  .leftJoinAndSelect('seller_review_entity.seller', 'seller')
                  .leftJoinAndSelect('seller_review_entity.listing', 'listing')
                  // .leftJoinAndSelect('seller_review.listing.location', 'listing.location')
                  .where("seller_review_entity.sellerId = :id", { id: userId })
    
    if (paging.starting_after){
      sql = sql.andWhere("seller_review_entity.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.andWhere("seller_review_entity.id < :ending_before", {ending_before: paging.ending_before} )
    }
    
    if (filters?.stars){
      sql = sql.where("seller_review_entity.rating IN (:...starFilters)", {starFilters: filters.stars})
    }
    
    const limit:number = Math.min(1000, paging.limit? paging.limit: 1000)
    sql = sql.take(limit)

    const findReviews = await sql.getManyAndCount()

    const reviewsList = findReviews[0]
    const count = findReviews[1]

    
    const hasMore = reviewsList.length === limit;

    const reviews: Reviews = {
      count: count,
      hasMore,
      items: reviewsList
    }

    return reviews;
  }

  public async userReviewList(userId: number): Promise<Reviews>{

    const review:[SellerReviewEntity[], number] = await SellerReviewEntity.createQueryBuilder("sr")
                  .select(["sr.id","sr.dateCreated",  "sr.isDeleted", "sr.review", "sr.rating"])
                  .leftJoinAndSelect('sr.reviewer', 'reviewer')
                  .leftJoinAndSelect('sr.seller', 'seller')
                  .leftJoinAndSelect('sr.listing', 'listing')
                  // .leftJoinAndSelect('sr.listing.location', 'listng.location')
                  .where("sr.reviewerId = :id", { id: userId }).printSql().getManyAndCount()

    const reviews: Reviews = {
      count: review[1],
      items: review[0]
    }

    return reviews;
  }

  public async userReviewSummary(userId: number): Promise<SummaryReview>{
    const userReviews = await SellerReviewEntity.findAndCount({
      where: {sellerId: userId},
      select: ["rating"]
    })
    const summary = {
        reviewCount: userReviews[1],
        five_star_count : 0,
        four_star_count : 0,
        three_star_count : 0,
        two_star_count : 0,
        one_star_count: 0,
        avgRating : userReviews[0].length > 0 ?  userReviews[0].reduce((accu, curr) => accu + Math.ceil(curr.rating), 0)/ userReviews[1] : 0
    }

    userReviews[0].forEach(rating => {
      const r = Math.ceil(rating.rating);
      if (r < 2) summary.one_star_count += 1
      else if (r < 3) summary.two_star_count += 1
      else if (r < 4) summary.three_star_count += 1
      else if (r < 5) summary.four_star_count += 1
      else summary.five_star_count += 1
    })
    

    // console.log("raw", userReviews)
    // console.log("summary", summary)
    return summary
  }
}
