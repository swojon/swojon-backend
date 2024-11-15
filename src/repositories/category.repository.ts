import { CategoryArgs, CategoryCreateDTO, CategoryFilterInput, CategoryRemoveDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { CommunityFilterInput } from "@/dtos/community.dto";
import { CategoryEntity, Status } from "@/entities/category.entity";
import { HttpException } from "@/exceptions/httpException";
import { Categories, Category } from "@/interfaces/category.interface";
import { SitemapLists } from "@/typedefs/listing.type";
import { registerEnumType } from "type-graphql";
import { EntityRepository, In, LessThan, MoreThan, UpdateResult } from "typeorm";

@EntityRepository(CategoryEntity)
export class CategoryRepository{
  public async categorySitemapList(): Promise<SitemapLists> {
    const categories = await CategoryEntity.find({
      where: {
        isDeleted: false
      }
    })
    const sitemaps = categories.map((category) => {
      return {
        url: `${process.env.SITEMAP_BASE_URL}/categories/${category.slug}`,
        changefreq: "weekly",
        priority: 0.8, 
        lastmod: category.dateCreated
      }
    })
    return {items: sitemaps}
  }
  

  public async categoryList(paging: PagingArgs, filters: CategoryFilterInput ): Promise<Categories> {


    // const findCategories : [CategoryEntity[], number] = await CategoryEntity.findAndCount(
    //   {
    //     select: ["id", "name", "slug", "description", "banner",
    //       "status", "isFeatured", "isSponsored", "isGlobal", "parentCategory"],
    //     relations: ['parentCategory'],
    //     where:where,
    //     take: limit
    //   }
    // );

    let sql = CategoryEntity.createQueryBuilder("category_entity")
                    .select(["category_entity.id", "category_entity.name", "category_entity.slug", "category_entity.description",
                             "category_entity.banner", "category_entity.status", "category_entity.isFeatured",
                             "category_entity.isSponsored", "category_entity.isGlobal",  "category_entity.isDeleted", "category_entity.icon"])
                    .leftJoinAndSelect('category_entity.parentCategory', 'parentCategory')
                    .orderBy('category_entity.id', 'ASC')

    if (paging.starting_after){
      sql = sql.where("category_entity.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.where("category_entity.id < :ending_before", {ending_before: paging.ending_before} )
    }

    if (filters?.isFeatured){
        sql = sql.where("category_entity.isFeatured IN (:...isFeaturedFilters)", {isFeaturedFilters: filters.isFeatured})
    }

    // console.log("Query", sql.getSql())
    // const analyze =await CategoryEntity.query(`EXPLAIN (FORMAT json) ${sql.getSql()}`)
    // const count = await sql.getCount()
    // const count = analyze[0].['QUERY PLAN'][0]
    // console.log("Count", count)
    const limit:number = Math.min(1000, paging.limit? paging.limit: 1000)
    sql = sql.limit(limit)

    const findCategories = await sql.getManyAndCount()

    const categoryList = findCategories[0]
    const count = findCategories[1]

    // const categoryTree: Category[] =  getCategoryTree(categoryList, null)

    const hasMore = categoryList.length === limit;


    // const prevCursor = paging.starting_after? paging.starting_after: paging.ending_before? paging.ending_before: null
    // const nextCursor = categoryList[categoryList.length -1].id

    return {items: categoryList, hasMore, count}

  }

  public async categoryAdd(categoryData: CategoryCreateDTO): Promise<Category> {
    const findCategory: CategoryEntity = await CategoryEntity.findOne({ where:
                    [{ name: categoryData?.name }, {slug:categoryData?.slug}],
                    });
    if (findCategory) throw new HttpException(409, `Category with name ${categoryData.name} already exists`);
    let parentCategory:CategoryEntity|null = null;

    if (categoryData.parentCategoryId) {
      parentCategory  = await CategoryEntity.findOne({where: {id: categoryData.parentCategoryId}});
      if (!parentCategory) throw new HttpException(409, `Parent Category with id ${categoryData.parentCategoryId} does not exist`);
    }

    const createCategoryData: CategoryEntity = await CategoryEntity.create({...categoryData, parentCategory}).save();

    return createCategoryData;
  }

  public async categoryRemove(categoryId: number): Promise<Category> {
    const findCategory: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId } });
    if (!findCategory) throw new HttpException(409, `Category with id ${categoryId} does not exist`);

    // await CategoryEntity.delete({ id: categoryId });
    // await findCategory.softRemove()
    await CategoryEntity.softRemove(findCategory)
    return findCategory;
  }

  public async categoriesRemove(categoryData: CategoryRemoveDTO): Promise<Categories> {
    const categoryIds = categoryData.categoryIds
    await CategoryEntity.createQueryBuilder('ce').softDelete().whereInIds(categoryData.categoryIds).execute()
    const findCategories: CategoryEntity[] = await CategoryEntity.find({
      select: ["id", "name", "slug", "description", "banner", 'status', 'isDeleted', 'isFeatured', 'isGlobal', 'isDeleted', "icon"],
      relations: ["parentCategory"],
      where: {id: In(categoryData.categoryIds)},
      withDeleted: true
    })
    return {items: findCategories}
}

  public async categoryFind(categoryArgs: CategoryArgs): Promise<CategoryEntity> {
    const findCategory: CategoryEntity = await CategoryEntity.findOne(
                    {
                      where: [
                          {id: categoryArgs?.id},
                          {slug: categoryArgs?.slug},
                          {name: categoryArgs?.name}],
                      relations: ['parentCategory']
                    },
                  );
    if (!findCategory) throw new HttpException(409, `Category not found`);
    return findCategory;
  }

  public async categoryUpdate(categoryId: number, categoryData: CategoryUpdateDTO): Promise<Category> {
    const category: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId } });
    if (!category) throw new HttpException(409, `Category with id ${categoryId} does not exist`);
    
    let dataToUpdate: any = categoryData;
    Object.keys(dataToUpdate).forEach(key => {
      if (!dataToUpdate[key] ) {
        delete dataToUpdate[key];
      }
    });

    if (dataToUpdate.parentCategoryId){
      const parentCategory:CategoryEntity = await CategoryEntity.findOne({where: {id: dataToUpdate.parentCategoryId}})
      if (!parentCategory) throw new HttpException(409, `Parent Category with id ${categoryId} does not exist`);
      delete dataToUpdate.parentCategoryId
      dataToUpdate["parentCategory"] = parentCategory
    }

    await CategoryEntity.update({ id: categoryId }, dataToUpdate);

    const updatedCategory: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId }, relations: ['parentCategory'] });
    return updatedCategory;

  }

}
