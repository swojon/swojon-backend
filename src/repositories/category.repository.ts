import { CategoryArgs, CategoryCreateDTO, CategoryUpdateDTO, PagingArgs } from "@/dtos/category.dto";
import { CategoryEntity, Status } from "@/entities/category.entity";
import { HttpException } from "@/exceptions/httpException";
import { Categories, Category } from "@/interfaces/category.interface";
import { registerEnumType } from "type-graphql";
import { EntityRepository, LessThan, MoreThan } from "typeorm";

@EntityRepository(CategoryEntity)
export class CategoryRepository{

  public async categoryList(paging: PagingArgs ): Promise<Categories> {
    const getCategoryTree = (categories:CategoryEntity[], target: Category|null):Category[] =>{
      let cats = categories.filter(cat => target === null? cat.parentCategory === null: cat.parentCategory?.id === target.id)
      const categoryList:Category[] = []

      cats.forEach(cat => {
        categoryList.push({
          ...cat,
          children: getCategoryTree(categories, cat)
        })
      });
      return categoryList
    }

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
                    .select(["category_entity.id", "category_entity.name", "category_entity.slug", "category_entity.description", "category_entity.banner", "category_entity.status", "category_entity.isFeatured", "category_entity.isSponsored", "category_entity.isGlobal"])
                    .leftJoinAndSelect('category_entity.parentCategory', 'parentCategory')

    if (paging.starting_after){
      sql = sql.where("category_entity.id > :starting_after", {starting_after: paging.starting_after})
    }else if (paging.ending_before){
      sql = sql.where("category_entity.id < :ending_before", {ending_before: paging.ending_before} )
    }

    // console.log("Query", sql.getSql())
    // const analyze =await CategoryEntity.query(`EXPLAIN (FORMAT json) ${sql.getSql()}`)
    // const count = analyze[0]["QUERY PLAN"][0]["Plan"]["Plan Rows"]
    // const count = analyze[0].['QUERY PLAN'][0]
    // console.log("Count", count)
    const limit:number = Math.min(100, paging.limit?paging.limit: 100)
    sql = sql.limit(limit)

    const findCategories = await sql.getManyAndCount()

    const categoryList = findCategories[0]
    // const categoryTree: Category[] =  getCategoryTree(categoryList, null)

    const hasMore = categoryList.length === limit;

    // const prevCursor = paging.starting_after? paging.starting_after: paging.ending_before? paging.ending_before: null
    // const nextCursor = categoryList[categoryList.length -1].id

    return {items: categoryList, hasMore: hasMore}

  }

  public async categoryAdd(categoryData: CategoryCreateDTO): Promise<Category> {
    const findCategory: CategoryEntity = await CategoryEntity.findOne({ where:
                    [{ name: categoryData?.name }, {slug:categoryData?.slug}]
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

    await CategoryEntity.delete({ id: categoryId });

    return findCategory;
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

    if (categoryData.parentCategoryId){
      const parentCategory:CategoryEntity = await CategoryEntity.findOne({where: {id: categoryData.parentCategoryId}})
      if (!parentCategory) throw new HttpException(409, `Parent Category with id ${categoryId} does not exist`);
      delete categoryData.parentCategoryId
      categoryData["parentCategory"] = parentCategory
    }

    await CategoryEntity.update({ id: categoryId }, categoryData);

    const updatedCategory: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId }, relations: ['parentCategory'] });
    return updatedCategory;

  }

}
