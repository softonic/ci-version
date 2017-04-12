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
  .option('--next', 'Return the next version that would be created', prog.BOOL)
  .action(function(args, options) {
    const { repository, compatibleWith, next } = options;

    const newVersion = createVersion({
      repositoryPath: repository,
      compatibleWith,
      isNext: next
    });
    console.log(newVersion || '');
  });

prog.parse(process.argv);
