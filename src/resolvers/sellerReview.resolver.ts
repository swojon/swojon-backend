import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { SellerReviewRepository } from '@/repositories/sellerReview.repository';
import { Review, Reviews } from '@/typedefs/sellerReview.type';
import { ReviewCreateDTO, ReviewUpdateDTO } from '@/dtos/sellerReview.dto';

@Resolver()
export class SellerReviewResolver extends SellerReviewRepository {
  // @Authorized()
  @Query(() => Reviews, {
    description: 'List All Reviews of a Listing',
  })
  async listListingReviews(@Arg('listingId') listingId: number): Promise<Reviews> {
    const reviews: Reviews = await this.listingReviewList(listingId);
    return reviews;

  }

  @Query(() => Reviews, {
    description: 'List All Reviews of a seller',
  })
  async listSellerReviews(@Arg('userId') userId: number): Promise<Reviews> {
    const reviews: Reviews = await this.sellerReviewList(userId);
    return reviews;
  }

  @Query(() => Reviews, {
    description: 'List All Reviews of a user',
  })
  async listUserReviews(@Arg('userId') userId: number): Promise<Reviews> {
    const reviews: Reviews = await this.userReviewList(userId);
    return reviews;
  }


  // @Authorized()
  @Mutation(() => Review, {
    description: 'Add Review to a listing',
  })
  async createListingReview(@Arg('reviewData') reviewData: ReviewCreateDTO): Promise<Review> {
    const review: Review = await this.listingReviewAdd(reviewData);
    return review;
  }

  // @Authorized()
  @Mutation(() => Review, {
    description: 'Update Listing/Seller Review',
  })
  async updateListingReview(@Arg('reviewId') reviewId: number, @Arg('reviewData') reviewData: ReviewUpdateDTO): Promise<Review> {
    const review: Review = await this.listingReviewUpdate(reviewId, reviewData);
    return review;
  }

  // @Authorized()
  @Mutation(() => Review, {
    description: 'Remove Listing/Seller Review',
  })
  async removeListingReview(@Arg('reviewId') reviewId: number): Promise<Review> {
    const review: Review = await this.listingReviewRemove(reviewId);
    return review;
  }



}
