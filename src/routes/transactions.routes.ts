import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

// import path from 'path';
import TransactionsRepository from '../repositories/TransactionsRepository';

// import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();

// Carregando o middleware do multer para o carregamento de arquivos
const upload = multer(uploadConfig);

// Obter todas as transações e o balanço da conta
transactionsRouter.get('/', async (request: Request, response: Response) => {
  // Obtendo o repositório de transações
  const transactionRepository = getCustomRepository(TransactionsRepository);

  // Obtendo as transações
  const transactions = await transactionRepository.find();

  // Obtendo o balanço da conta
  const balance = await transactionRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

// Criando uma nova transação
transactionsRouter.post('/', async (request: Request, response: Response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json(transaction);
});

// Deletando a Transaction
transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const { id } = request.params;
    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute(String(id));

    return response.status(204).json();
  },
);

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request: Request, response: Response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
