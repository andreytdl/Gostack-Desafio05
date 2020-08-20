import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  // Guardando o diretorio dos arquivos temporarios
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      // Gerando 10 bytes de texto aleatório para que os nomes não se repitam
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      // Configuração da doc do multer -> Isso devolve que deu certo
      return callback(null, fileName);
    },
  }),
};
