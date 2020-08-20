import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // console.log('Opaaaaaa', title);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    // Não permite que seja sacado acima do valor na conta
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Saldo insuficiente!', 400);
    }

    const createCategory = new CreateCategoryService();

    const categoryObject = await createCategory.execute(category);

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category: categoryObject,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
