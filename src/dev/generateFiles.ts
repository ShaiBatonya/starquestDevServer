// src/dev/generateFiles.ts

import fs from 'fs';
import path from 'path';

// ------------------------------------------------------------------------------
// Get the model name from the command line argument
// ------------------------------------------------------------------------------
const modelName = process.argv[2];

if (!modelName) {
  console.error('Please provide a model name.');
  process.exit(1);
}

// ------------------------------------------------------------------------------
// Define base path and folders to be created
// ------------------------------------------------------------------------------
const basePath = path.join(__dirname, '../api');
const folders: Array<keyof typeof extensions> = [
  'models',
  'types',
  'routes',
  'controllers',
  'services',
  'validations',
  'docs',
];

// ------------------------------------------------------------------------------
// Define the extensions for each folder
// ------------------------------------------------------------------------------
const extensions = {
  models: 'model.ts',
  types: 'interface.ts',
  routes: 'route.ts',
  controllers: 'controller.ts',
  services: 'service.ts',
  validations: 'validations.ts',
  docs: 'doc.ts',
};

// ------------------------------------------------------------------------------
// Function to create a file with given content in a specific folder
// ------------------------------------------------------------------------------
const createFile = (folder: keyof typeof extensions): void => {
  const content = `// src/api/${folder}/${modelName.toLowerCase()}.${extensions[folder]}\n`;
  const dirPath = path.join(basePath, folder);

  // ------------------------------------------------------------------------------
  // Create the directory if it doesn't exist
  // ------------------------------------------------------------------------------
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const fileName = `${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.${extensions[folder]}`;
  const filePath = path.join(dirPath, fileName);

  // ------------------------------------------------------------------------------
  // Write the content to the file
  // ------------------------------------------------------------------------------
  fs.writeFileSync(filePath, content);
};

// ------------------------------------------------------------------------------
// Iterate through folders and create files for each
// ------------------------------------------------------------------------------
folders.forEach((folder) => createFile(folder));

console.log('Files generated successfully for model:', modelName);

// ------------------------------------------------------------------------------
// Command to run the script: 'ts-node src/dev/generateFiles.ts modelname'
// ------------------------------------------------------------------------------
