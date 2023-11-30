import { ReviewCreateDTO, ReviewUpdateDTO } from "@/dtos/sellerReview.dto";
import { ListingEntity } from "@/entities/listing.entity";
import { SellerReviewEntity } from "@/entities/sellerReview.entity";
import { UserEntity } from "@/entities/users.entity";
import { HttpException } from "@/exceptions/httpException";
import { Review } from "@/interfaces/sellerReview.interface";
import { Reviews } from "@/typedefs/sellerReview.type";
import { EntityRepository } from "typeorm";


@EntityRepository(SellerReviewEntity)
export class SellerReviewRepository{

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

  public async sellerReviewList(userId: number): Promise<Reviews>{

    const review:[SellerReviewEntity[], number] = await SellerReviewEntity
                  .createQueryBuilder("seller_review_entity")
                  .select(["seller_review_entity.id","seller_review_entity.dateCreated",  "seller_review_entity.isDeleted", "seller_review_entity.review", "seller_review_entity.rating"])
                  .leftJoinAndSelect('seller_review_entity.reviewer', 'reviewer')
                  .leftJoinAndSelect('seller_review_entity.seller', 'seller')
                  .leftJoinAndSelect('seller_review_entity.listing', 'listing')
                  // .leftJoinAndSelect('seller_review.listing.location', 'listing.location')
                  .where("seller_review_entity.sellerId = :id", { id: userId }).printSql().getManyAndCount()

    const reviews: Reviews = {
      count: review[1],
      items: review[0]
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


}
