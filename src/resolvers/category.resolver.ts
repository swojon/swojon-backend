
import { CategoryArgs, CategoryCreateDTO, CategoryFilterInput, CategoryRemoveDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { MyContext } from "@/interfaces/auth.interface";
import { CategoryRepository } from "@/repositories/category.repository";
import { Categories, Category } from "@/typedefs/category.type";
import { SitemapLists } from "@/typedefs/listing.type";
import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class CategoryResolver extends CategoryRepository{

  // @Authorized()
  @Query(() => Categories, {
    description: 'List All Categories',
  })
  async listCategories(@Ctx() ctx:MyContext, @Args() paging: PagingArgs, @Arg('filters', { nullable: true }) filters? : CategoryFilterInput): Promise<Categories> {
    const categories: Categories = await this.categoryList(paging, filters);
      return categories;
  }

  @Query(() => SitemapLists, {
    description: "Get all categories sitemap",
  })
  async generateCategoriesSitemap(): Promise<SitemapLists> {
    const sitemaps: SitemapLists = await this.categorySitemapList();
    return sitemaps;
  }

  // @Authorized()
  @Mutation(() => Category, {
    description: 'Create Category',
  })
  async createCategory(@Arg('categoryData') categoryData : CategoryCreateDTO): Promise<Category> {
    const category: Category = await this.categoryAdd(categoryData);
    return category;
  }

  // @Authorized()
  @Query(() => Category, {
    description: "Get Category by Id, slug or name",
  })
  async getCategory(@Args(){id, slug, name}: CategoryArgs): Promise<Category> {
    const category: Category = await this.categoryFind({id, slug, name});
    return category;
  }

  // @Authorized()
  @Mutation(() => Category, {
    description: 'Remove Category',
  })
  async removeCategory(@Arg('categoryId') categoryId: number): Promise<Category> {
    const category: Category = await this.categoryRemove(categoryId);
    return category;
  }

  // @Authorized()
  @Mutation(() => Categories, {
    description: 'Remove Categories',
  })
  async removeCategories(@Arg('categoryData') categoryData: CategoryRemoveDTO): Promise<Categories> {
    const categories: Categories = await this.categoriesRemove(categoryData);
    return categories;
  }


  // @Authorized()
  @Mutation(() => Category, {
    description: 'Update Category',
  })
  async updateCategory(@Arg('categoryId') categoryId: number, @Arg('categoryData') categoryData: CategoryUpdateDTO): Promise<Category> {
    const category: Category = await this.categoryUpdate(categoryId, categoryData);
    return category;
  }
}
