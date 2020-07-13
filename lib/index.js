const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { CHARACTERS, WEIGHTS } = require('./config');

const CHARACTERS_STRING = CHARACTERS.join(',');

const TYPEFACES_DIR = `${__dirname}/typefaces`;
const DIST_DIR = `${__dirname}/../dist`;

const fontStyles = [];
const fontOptions = [];

const typefaces = fs.readdirSync(TYPEFACES_DIR).filter(x => !x.startsWith('.'));

const fonts = typefaces.reduce((acc, name) => {
  acc[name] = fs.readdirSync(`${TYPEFACES_DIR}/${name}`).filter(x => !x.startsWith('.'));
  return acc;
}, {});

execSync(`rm -rf ${DIST_DIR}`);
fs.mkdirSync(DIST_DIR);
console.log('Dist dir cleared.');

Object.keys(fonts).forEach(key => {
  console.log('------------------------');
  console.log(`Processing '${key}'...`);

  const fontDistDir = `${DIST_DIR}/${key}`;
  const fontSrcDir = `${TYPEFACES_DIR}/${key}`;

  fs.mkdirSync(fontDistDir);
  console.log(`Dir for '${key}' created.`);

  const fontFiles = fonts[key];

  fontFiles.forEach(file => {
    console.log('------------');

    const filebasename = path.basename(file, path.extname(file));
    const [weight, style = 'normal'] = filebasename.split('--');
    console.log(`Processing '${key}/${filebasename}'...`);

    const srcTTFPath = `${fontSrcDir}/${file}`;
    const destPathBase = `${fontDistDir}/${filebasename}`;

    // we don't need TTF to inject on webpages, but generate it
    // just because we can
    convert(srcTTFPath, `${destPathBase}.ttf`, CHARACTERS_STRING);
    console.log('TTF created.');

    const prevTTFSize = Math.ceil(fs.statSync(srcTTFPath).size / 1024);
    const currentTTFSize = Math.ceil(fs.statSync(`${destPathBase}.ttf`).size / 1024);
    console.log(`TTF subset created. Stat: ${prevTTFSize} Kb → ${currentTTFSize} Kb (−${Math.floor(100 - currentTTFSize / prevTTFSize * 100)}%).`);

    convert(srcTTFPath, `${destPathBase}.woff`, CHARACTERS_STRING);
    console.log('WOFF created.');

    convert(srcTTFPath, `${destPathBase}.woff2`, CHARACTERS_STRING);
    console.log('WOFF2 created.');

    const className = `${key.replace(/\s*/g, '')}--${filebasename}`;

    fontStyles.push(`
      @font-face {
        src: url('${key}/${filebasename}.woff2') format('woff2'), url('${key}/${filebasename}.woff') format('woff');
        font-family: ${key};
        font-weight: ${WEIGHTS[weight]};
        font-style: ${style};
      }

      .${className} {
        font-family: ${key};
        font-weight: ${WEIGHTS[weight]};
        font-style: ${style}
      }
    `);
    console.log('Styles generated.');

    fontOptions.push(`<option value="${className}">${key}/${filebasename}</option>`);
    console.log('Options generated.');

    const scss = `@font-face {
  src: url('${filebasename}.woff2') format('woff2'), url('${filebasename}.woff') format('woff');
  font-family: ${key};
  font-weight: ${WEIGHTS[weight]};
  font-style: ${style};
  font-display: swap;
}`;
    fs.writeFileSync(`${destPathBase}.scss`, scss);
    console.log('SCSS generated.');
  });

  console.log('------------');
  console.log(`Completed processing '${key}'.`);
});

const charactersInfo = CHARACTERS.reduce((acc, character) => {
  const [startHex, endHex] = character.split('-');

  if (!endHex) {
    const dec = parseInt(character, 16);
    return acc.concat([{
      hex: `U+${character}`,
      dec,
      char: String.fromCharCode(dec),
    }]);
  }

  const start = parseInt(startHex, 16);
  const end = parseInt(endHex, 16);
  const range = new Array(end - start + 1).fill(1).map((x, i) => start + i);
  const rangeInfo = range.map(dec => ({
    hex: `U+${dec.toString(16).padStart(4, '0')}`,
    dec,
    char: String.fromCharCode(dec),
  }));

  return acc.concat(rangeInfo);
}, []);

const fontTableElements = charactersInfo.map(x => {
  const title = `${x.hex} | ${x.dec}`;
  let character = x.char;

  if (character === '<') character = '&lt;';

  return `<div title="${title}">${character}</div>`;
});

const template = fs.readFileSync(`${__dirname}/templates/index.html`, 'utf8')
  .replace('#FONT_STYLES#', fontStyles.join('\n'))
  .replace('#FONT_OPTIONS#', fontOptions.join('\n'))
  .replace('#FONT_TABLE_ELEMENTS#', fontTableElements.join('\n'));

fs.writeFileSync(`${DIST_DIR}/index.html`, template);

console.log('------------------------');

console.log('Demo page generated.');

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
