const fs = require('fs/promises');
const path = require('path');
const url = require('url');
const { processSchema } = require('./utils/schemaProcessor');

const jsonSchemaFilePath = process.argv[2];
const outputMarkdownFilePath = process.argv[3];

/**
 * Recursively list all files in a directory with a specific extension.
 * @param {string} dir 
 * @param {string} extension 
 * @returns {Promise<string[]>}
 */
async function listFiles(dir, extension) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  /** @type {string[]} */
  const jsonFiles = [];

  for (const file of files) {
    if (file.isDirectory()) {
      const nestedJsonFiles = await listFiles(path.join(dir, file.name), extension);
      jsonFiles.push(...nestedJsonFiles);
    } else if (file.name.endsWith(extension)) {
      jsonFiles.push(path.join(dir, file.name));
    }
  }

  return jsonFiles;
}

(async () => {
  if (!jsonSchemaFilePath) {
    console.error('Please provide a path to the JSON schema file or directory.');
    process.exit(1);
  }
  
  try {
    const isDirectory = (await fs.stat(jsonSchemaFilePath)).isDirectory();
    const fileList = isDirectory
      ? await listFiles(jsonSchemaFilePath, '.json')
      : [jsonSchemaFilePath];
    const schemas = {};
    const options = {
      rootPath: isDirectory ? jsonSchemaFilePath : path.dirname(jsonSchemaFilePath),
      output: "single"
    };
    for (let inputPath of fileList) {
      const data = await fs.readFile(inputPath, 'utf8');
    
      try {
        schemas[url.pathToFileURL(inputPath)] = JSON.parse(data);
      } catch (parseError) {
        console.error(`Error parsing JSON ${inputPath}: ${parseError.message}`);
        process.exit(1);
      }
    };
    const markdowns = processSchema(schemas, options);
    markdowns.forEach(async ({markdown, fileName}) => {
      let outputPath = outputMarkdownFilePath.endsWith('.md')
        ? outputMarkdownFilePath 
        : path.join(outputMarkdownFilePath, fileName);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, markdown);
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
})();