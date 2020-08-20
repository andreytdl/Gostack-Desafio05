import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Buscando pelo repositório que será deletado
    const transaction = await transactionsRepository.findOne(id);

    // Caso a transaction exista
    if (transaction) {
      await transactionsRepository.remove(transaction);
    }
    // Caso não exista
    else {
      throw new AppError('This transaction does not exists!', 400);
    }
  }
}

export default DeleteTransactionService;
