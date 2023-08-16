import { CategoryArgs, CategoryCreateDTO, CategoryUpdateDTO } from "@/dtos/category.dto";
import { CategoryEntity } from "@/entities/category.entity";
import { HttpException } from "@/exceptions/httpException";
import { Categories, Category } from "@/interfaces/category.interface";
import { EntityRepository } from "typeorm";



@EntityRepository(CategoryEntity)
export class CategoryRepository{

  public async categoryList(): Promise<Categories> {
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
    const findCategories = await CategoryEntity.findAndCount(
      {
        select: ["id", "name", "slug", "description", "banner",
          "isLive", "isApproved", "isFeatured", "isSponsored", "isGlobal", "parentCategory"],
        relations: ['parentCategory'],
      }
    );
    const categoryList = findCategories[0]
    const categoryTree: Category[] =  getCategoryTree(categoryList, null)

    return {items: categoryTree}

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

    await CategoryEntity.update({ id: categoryId }, categoryData);

    const updatedCategory: CategoryEntity = await CategoryEntity.findOne({ where: { id: categoryId }, relations: ['parentCategory'] });
    return updatedCategory;

  }

}
