// src/api/middleware/modelLoader.ts

import fs from 'fs';
import path from 'path';

const loadModels = (relativePath: string = '../models'): void => {
  const modelsPath = path.join(__dirname, relativePath);

  fs.readdirSync(modelsPath).forEach((file) => {
    if (path.extname(file) === '.js' || path.extname(file) === '.ts') {
      require(path.join(modelsPath, file));
    }
  });
};

export default loadModels;
