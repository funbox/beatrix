#!/usr/bin/env node

const program = require('commander');
const beatrix = require('.');

program
  .usage('-c <path to config> [-o <output path>] <typefaces dir path>')
  .version(require('../package').version, '-v, --version')
  .description(`
A tool for converting and optimizing fonts.

Prerequisite:
  $ pip install fonttools zopfli brotli
`);

program
  .option('-c, --config <path>', 'path to config file (default: common ASCII symbols and some typographic ones)')
  .option('-o, --output <path>', 'path to the output dir (default: ./dist)')
  .parse(process.argv);

if (!program.args.length) {
  console.log('You have to pass paths to files or dirs with font files.');
  process.exit(1);
}

beatrix({
  configPath: program.config,
  outputPath: program.output,
  typefacesDirPath: program.args && program.args[0],
});
