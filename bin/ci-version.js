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
  .action(function(args, options) {
    const { repository, compatibleWith } = options;

    const newVersion = createVersion({ repositoryPath: repository, compatibleWith });
    console.log(newVersion || '');
  });

prog.parse(process.argv);
