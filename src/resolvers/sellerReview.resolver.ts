import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { SellerReviewRepository } from '@/repositories/sellerReview.repository';
import { Review, Reviews, SummaryReview } from '@/typedefs/sellerReview.type';
import { ReviewCreateDTO, ReviewFilterInput, ReviewUpdateDTO, SellerReviewCreateDTO } from '@/dtos/sellerReview.dto';
import { PagingArgs } from '@/dtos/category.dto';
import { isLoggedIn, isStaff } from '@/permission';
import { MyContext } from '@/interfaces/auth.interface';

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
  
  @Query(() => SummaryReview, {
    description: 'List All Reviews of a seller',
  })
  async summaryUserReview(@Arg('usernameOrId') usernameOrId: string): Promise<SummaryReview> {
    const reviews: SummaryReview = await this.userReviewSummary(usernameOrId);
    return reviews;
  }
  @Query(() => Reviews, {
    description: 'List All Reviews of a seller',
  })
  async listSellerReviews(@Arg('usernameOrId') usernameOrId: string,  @Args() paging: PagingArgs, @Arg('filters', { nullable: true }) filters? : ReviewFilterInput): Promise<Reviews> {
    const reviews: Reviews = await this.sellerReviewList(usernameOrId, paging, filters);
    return reviews;
  }

  @Query(() => Reviews, {
    description: 'List All Reviews of a user',
  })
  async listUserReviews(@Arg('usernameOrId') usernameOrId: string): Promise<Reviews> {
    const reviews: Reviews = await this.userReviewList(usernameOrId);
    return reviews;
  }


  // @Authorized()
  @Mutation(() => Review, {
    description: 'Add Review to a listing',
  })
  async createListingReview(@Arg('reviewData') reviewData: ReviewCreateDTO, @Ctx() ctx:MyContext): Promise<Review> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const review: Review = await this.listingReviewAdd(reviewData);
    return review;
  }

    // @Authorized()
  @Mutation(() => Review, {
      description: 'Add Review to a seller',
    })
    async createSellerReview(@Arg('reviewData') reviewData: SellerReviewCreateDTO): Promise<Review> {
      const review: Review = await this.sellerReviewAdd(reviewData);
      return review;
    }
  
  // @Authorized()
  @Mutation(() => Review, {
    description: 'Update Listing/Seller Review',
  })
  async updateListingReview(@Arg('reviewId') reviewId: number, @Arg('reviewData') reviewData: ReviewUpdateDTO, @Ctx() ctx:MyContext): Promise<Review> {
    if (!isLoggedIn(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const review: Review = await this.listingReviewUpdate(reviewId, reviewData);
    return review;
  }

  // @Authorized()
  @Mutation(() => Review, {
    description: 'Remove Listing/Seller Review',
  })
  async removeListingReview(@Arg('reviewId') reviewId: number, @Ctx() ctx:MyContext): Promise<Review> {
    if (!isStaff(ctx.user)) {
      throw new Error("You don't have permission to access this resource");
    }
    const review: Review = await this.listingReviewRemove(reviewId);
    return review;
  }



}
