const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const {
  CHARACTERS: DEFAULT_CHARACTERS,
} = require('./config');

const DEFAULT_OUTPUT_DIR = './dist';

const WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

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

  const demoFontsData = [];
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
      const destPathCSS = `${destPathBase}.css`;

      // we don't need TTF to inject on webpages, but generate it
      // just because we can
      convert(srcTTFPath, destPathTTF, charactersString);

      console.log(`TTF subset: ${buildTTFSubsetStat(srcTTFPath, destPathTTF)}`);
      console.log('TTF created.');

      convert(srcTTFPath, destPathWOFF, charactersString);
      console.log('WOFF created.');

      convert(srcTTFPath, destPathWOFF2, charactersString);
      console.log('WOFF2 created.');

      const [weightName, style = 'normal'] = filename.split('--');

      writeCSSFile({ filename, fontFamily, weightName, style, destPath: destPathCSS });
      console.log('CSS generated.');

      demoFontsData.push({ filename, fontFamily, weightName, style });
      console.log('Demo font data saved.');
    });

    console.log('------------');
    console.log(`Completed processing '${fontFamily}'.`);
  });

  console.log('------------------------');

  writeDemoPage({ fontsData: demoFontsData, charactersCodes, outputPath });

  console.log('Demo page generated.');
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

function writeCSSFile({ filename, fontFamily, weightName, style, destPath }) {
  const css = `@font-face {
  src: url('${filename}.woff2') format('woff2'), url('${filename}.woff') format('woff');
  font-family: '${fontFamily}';
  font-weight: ${WEIGHTS[weightName]};
  font-style: ${style};
  font-display: swap;
}`;
  fs.writeFileSync(destPath, css);
}

function writeDemoPage({ fontsData, charactersCodes, outputPath }) {
  const template = fs.readFileSync(path.join(__dirname, './templates/index.html'), 'utf8')
    .replace('#FONT_STYLES#', fontsData.map(buildDemoFontStyles).join('\n'))
    .replace('#FONT_OPTIONS#', fontsData.map(buildDemoFontOption).join('\n'))
    .replace('#FONT_TABLE_ELEMENTS#', buildDemoCharactersCells(charactersCodes).join('\n'));

  fs.writeFileSync(path.join(outputPath, 'index.html'), template);
}

function buildDemoFontStyles({ fontFamily, filename, weightName, style }) {
  return `@font-face {
  src: url('${fontFamily}/${filename}.woff2') format('woff2'), url('${fontFamily}/${filename}.woff') format('woff');
  font-family: '${fontFamily}';
  font-weight: ${WEIGHTS[weightName]};
  font-style: ${style};
}

.${buildClassName(fontFamily, filename)} {
  font-family: '${fontFamily}';
  font-weight: ${WEIGHTS[weightName]};
  font-style: ${style}
}`;
}

function buildDemoFontOption({ fontFamily, filename }) {
  return `<option value="${buildClassName(fontFamily, filename)}">${fontFamily}/${filename}</option>`;
}

function buildDemoCharactersCells(charactersCodes) {
  return generateCharactersInfo(charactersCodes)
    .map(x => {
      let character = x.char;

      if (character === '<') character = '&lt;';

      return `<div title="${x.title}">${character}</div>`;
    });
}

function generateCharactersInfo(charactersCodes) {
  return charactersCodes.reduce((acc, hex) => {
    const [startHex, endHex] = hex.split('-');

    if (!endHex) {
      const dec = hexToDec(hex);
      return acc.concat([{
        title: getCharacterTitleByHex(hex),
        char: String.fromCharCode(dec),
      }]);
    }

    const start = hexToDec(startHex);
    const end = hexToDec(endHex);
    const range = new Array(end - start + 1)
      .fill(true)
      .map((x, i) => {
        const dec = start + i;

        return {
          title: getCharacterTitleByHex(decToHex(dec)),
          char: String.fromCharCode(dec),
        };
      });

    return acc.concat(range);
  }, []);
}

function buildClassName(fontFamily, filename) {
  return `${fontFamily.replace(/\s*/g, '')}--${filename}`;
}

function hexToDec(hex) {
  return parseInt(hex, 16);
}

function decToHex(dec) {
  return dec.toString(16).padStart(4, '0');
}

function getCharacterTitleByHex(hex) {
  return `U+${hex} | ${hexToDec(hex)}`;
}

function getAbsPath(p) {
  return path.resolve(process.cwd(), p);
}
