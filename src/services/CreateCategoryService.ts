import { getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Category from '../models/Category';

class CreateCategoryService {
  public async execute(categoryName: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    // Verificando se existe alguma categoria de mesmo nome
    const sameName = await categoryRepository.findOne({
      where: { name: categoryName },
    });

    // Caso já exista alguma categoria de mesmo nome
    if (sameName) {
      return sameName;
    }

    // Caso seja a primeira criaremos ela no banco e a retornaremos

    const category = await categoryRepository.create({
      title: categoryName,
    });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
