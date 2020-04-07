const fs = require('fs');
const { join } = require('path');

const getFilesWithExtension = source => fs.readdirSync(source).map(name => join(source, name));

const getFiles = source =>
  fs
    .readdirSync(source)
    .map(name => join(source, name))
    .filter(s => !s.includes('index'))
    .map(name => name.split('/').pop());

const foldersMap = new Map();

const getFolders = key => {
  let folders = foldersMap.get(key);
  if (!folders) {
    folders = [];
    foldersMap.set(key, folders);
  }
  return folders;
};

const arrayEquals = (arr1, arr2) =>
  arr1.length == arr2.length &&
  arr1.every(function(u, i) {
    return u === arr2[i];
  });

module.exports = class CreateExports {
  constructor(options) {
    this.options = options;
  }

  createExports = (exportType, folder, path) => {
    const fileName = folder.split('.')[0];

    const exps = {
      default: `export { default as ${fileName} } from './${fileName}';`,
      named: `export * from './${fileName}';`,
    };

    const detect = () => {
      let filePath = join(path, folder);
      const file = fs.lstatSync(filePath);
      if (file.isDirectory()) {
        filePath = getFilesWithExtension(filePath)
          .filter(f => f.includes(`index${this.options.extension}`))
          .pop();
      }

      const fileStream = fs.readFileSync(filePath, 'utf8');

      const hasDefaultExport = fileStream
        .toString()
        .split('\n')
        .find(s => s.startsWith('export default'));
      return hasDefaultExport ? exps.default : exps.named;
    };

    return exps[exportType] || detect(folder);
  };

  apply(compiler) {
    compiler.hooks.compilation.tap('CreateExports', compilation => {
      const { baseDir, extension, paths } = this.options;

      paths.forEach(p => {
        const exportType = p.exportType || this.options.exportType || 'named';
        const path = join(baseDir || process.cwd(), typeof p === 'string' ? p : p.path);

        const entries = getFiles(path);
        if (arrayEquals(entries, getFolders(path))) {
          return;
        }

        foldersMap.set(path, entries);

        try {
          const imports = entries.reduce(
            (acc, folder) => `${acc}${this.createExports(exportType, folder, path)}\n`,
            '',
          );

          fs.writeFile(`${path}/index${extension}`, imports, err => {
            if (err) {
              compilation.errors.push(err);
            }
          });
        } catch (err) {
          compilation.errors.push(err);
        }
      });
    });
  }
};
