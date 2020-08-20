import csvParse from 'csv-parse';
import fs from 'fs';

import { getRepository, In, getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    // Criando o arquivo na pasta tmp
    const contactsReadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      // delimiter: ';' //Isso é para caso queiramos separar o nosso csv por ; ou qualquer outra coisa ao invés de , que é o padrão
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      // console.log(title, type, value, category);

      // Caso alguma dessas informações esteja faltando ele já retorna pois não deve ser inserido
      if (!title || !type || !value) {
        return;
      }

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // Verificando se o arquivo foi completamente lido
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // Refaremos a logica de existencia de categorias aqui, pois aqui estamos fazendo em lote
    // Caso optassemos por utilizar um for na unitária ficariamos abrindo e fechando o banco toda hora

    // Buscando as categorias que possuem o nome contido em categories
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // console.log(existentCategories);
    // console.log(transactions);

    // Obtendo os nomes das categorias
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // Verificando as categorias que não existiam antes
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      // Removendo duplicados
      .filter((value, index, self) => self.indexOf(value) === index);

    // Persistindo no banco
    const newCategories = await categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    // Persistindo as transactions no banco
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    // Excluindo o arquivo depois de importa-lo
    await fs.promises.unlink(filePath);
    // console.log(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
