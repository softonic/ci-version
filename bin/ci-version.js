#!/usr/bin/env node

const pkg = require('../package.json');
const createVersion = require('../src/createVersion');
const prog = require('caporal');

prog
  .version(pkg.version)
  .option('-r, --repository [directory]', 'Repository directory (default: .)', null, '.')
  .option(
    '-c --compatible-with [format]',
    'Compatible with version in the specified file (allowed: package.json, composer.json)',
    ['package.json', 'composer.json']
  )
  .option(
    '-r --prefix [prefix]',
    'Tag prefix (useful for repos with multiple versions: tags like application-v1.2.0 would need prefix `application-`',
    prog.STRING,
    ''
  )
  .option(
    '-p --path [path]',
    'Path for compatible-with file',
    null,
    '.'
  )
  .option('--next', 'Return the next version that would be created', prog.BOOL)
  .action(function(args, options) {
    const { repository, compatibleWith, path, next, prefix } = options;

    const newVersion = createVersion({
      repositoryPath: repository,
      compatibleWith,
      isNext: next,
      versionPath: path,
      prefix: prefix
    });
    console.log(newVersion || '');
  });

prog.parse(process.argv);
