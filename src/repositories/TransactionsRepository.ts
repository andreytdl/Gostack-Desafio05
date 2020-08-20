import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let totalValueIncomeTransactions = 0;
    let totalValueOutcomeTransactions = 0;

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.find();

    // Obtendo as transações do tipo income
    totalValueIncomeTransactions = transactions
      .filter(transaction => transaction.type === 'income')
      .map(x => Number(x.value))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    // Obtendo as transações do tipo outcome
    totalValueOutcomeTransactions = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(x => Number(x.value))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    const total = totalValueIncomeTransactions - totalValueOutcomeTransactions;

    const balance = {
      income: totalValueIncomeTransactions,
      outcome: totalValueOutcomeTransactions,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
