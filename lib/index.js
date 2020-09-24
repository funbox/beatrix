const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const {
  CHARACTERS: DEFAULT_CHARACTERS,
} = require('./config');

const DEFAULT_OUTPUT_DIR = './dist';

module.exports = beatrix;

function beatrix({ configPath, outputPath, typefacesDirPath }) {
  if (!configPath) {
    throw new Error('You have to specify path to config file.');
  }

  if (!typefacesDirPath) {
    throw new Error('You have to pass the path to dir with font files.');
  }

  configPath = getAbsPath(configPath);
  outputPath = getAbsPath(outputPath || DEFAULT_OUTPUT_DIR);
  typefacesDirPath = getAbsPath(typefacesDirPath);

  // it's fine here, we're loading user's config file
  // eslint-disable-next-line import/no-dynamic-require
  const userConfig = require(configPath);

  const charactersCodes = userConfig.CHARACTERS || DEFAULT_CHARACTERS;
  const charactersString = charactersCodes.join(',');

  const fontFamilies = loadFontFamilies(typefacesDirPath);

  if (!Object.keys(fontFamilies).length) {
    throw new Error('Directories with fonts not found.');
  }

  execSync(`rm -rf ${outputPath}`);
  fs.mkdirSync(outputPath);
  console.log('Output dir cleared.');

  Object.keys(fontFamilies).forEach(fontFamily => {
    console.log('------------------------');
    console.log(`Start processing '${fontFamily}'...`);

    const fontSrcDir = path.join(typefacesDirPath, fontFamily);
    const fontDestDir = path.join(outputPath, fontFamily);

    fs.mkdirSync(fontDestDir);
    console.log(`Dir for '${fontFamily}' created.`);

    fontFamilies[fontFamily].forEach(file => {
      console.log('------------');

      const filename = path.basename(file, path.extname(file));
      console.log(`Processing '${fontFamily}/${filename}'...`);

      const srcTTFPath = path.join(fontSrcDir, file);
      const destPathBase = path.join(fontDestDir, filename);

      const destPathTTF = `${destPathBase}.ttf`;
      const destPathWOFF = `${destPathBase}.woff`;
      const destPathWOFF2 = `${destPathBase}.woff2`;

      // we don't need TTF to inject on webpages, but generate it
      // just because we can
      convert(srcTTFPath, destPathTTF, charactersString);

      console.log(`TTF subset: ${buildTTFSubsetStat(srcTTFPath, destPathTTF)}`);
      console.log('TTF created.');

      convert(srcTTFPath, destPathWOFF, charactersString);
      console.log('WOFF created.');

      convert(srcTTFPath, destPathWOFF2, charactersString);
      console.log('WOFF2 created.');
    });

    console.log('------------');
    console.log(`Completed processing '${fontFamily}'.`);
  });

  console.log('------------------------');

  console.log('Done.');
}

function convert(src, dest, characters) {
  const args = [
    // input file
    `"${src}"`,

    // output file
    `--output-file="${dest}"`,

    // flavour of output font file. may be 'woff' or 'woff2'
    ...(dest.match(/\.woff$/) ? ['--flavor=woff'] : []),
    ...(dest.match(/\.woff2$/) ? ['--flavor=woff2'] : []),

    // use the google zopfli algorithm to compress WOFF.
    // the output is 3-8% smaller than pure zlib, but the compression speed is
    // much slower
    ...(dest.match(/\.woff$/) ? ['--with-zopfli'] : []),

    // drop all the features: 'calt', 'ccmp', 'clig', 'curs', 'dnom', 'frac',
    // 'liga', 'locl', 'mark', 'mkmk', 'numr', 'rclt', 'rlig', etc.
    // leave only 'tnum' to enable tabular (monospaced) figures
    // and 'kern' for enhanced kerning
    '--layout-features="tnum,kern"',

    // make the font unusable as a system font by replacing name IDs 1, 2, 3, 4,
    // and 6 with dummy strings (it is still fully functional as webfont)
    '--obfuscate-names',

    // comma/whitespace-separated list of Unicode codepoints or ranges
    // as hex numbers, optionally prefixed with 'U+', 'u', etc.
    // example: --unicodes="U+0041-005A,U+0061-007A"
    `--unicodes="${characters}"`,
  ].join(' ');

  execSync(`pyftsubset ${args}`);
}

function loadFontFamilies(dir) {
  return fs.readdirSync(dir)
    .reduce((acc, name) => {
      if (name.startsWith('.')) return acc;

      acc[name] = fs.readdirSync(path.join(dir, name))
        .filter(x => x.endsWith('.ttf') || x.endsWith('.otf'));

      return acc;
    }, {});
}

function buildTTFSubsetStat(srcTTFPath, destPathTTF) {
  const prevTTFSize = Math.ceil(fs.statSync(srcTTFPath).size / 1024);
  const currentTTFSize = Math.ceil(fs.statSync(destPathTTF).size / 1024);

  return `${prevTTFSize} Kb → ${currentTTFSize} Kb (−${Math.floor(100 - currentTTFSize / prevTTFSize * 100)}%).`;
}

function getAbsPath(p) {
  return path.resolve(process.cwd(), p);
}
