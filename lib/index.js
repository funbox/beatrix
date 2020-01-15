const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const opentype = require('opentype.js');

const { CHARACTERS, WEIGHTS } = require('./config');

const CHARACTERS_STRING = CHARACTERS.map(x => String.fromCharCode(x)).join('');

const TYPEFACES_DIR = `${__dirname}/typefaces`;
const DIST_DIR = `${__dirname}/../dist`;

const fontStyles = [];
const fontOptions = [];

const typefaces = fs.readdirSync(TYPEFACES_DIR);

const fonts = typefaces.reduce((acc, x) => {
  acc[x] = fs.readdirSync(`${TYPEFACES_DIR}/${x}`);
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

    const font = opentype.loadSync(srcTTFPath);

    // 0 glyph is .notdef which represents broken characters
    const usefulGlyphs = [font.glyphs.get(0)]
      .concat(font.stringToGlyphs(CHARACTERS_STRING))

      // some fonts (such as Roboto) may not have a glyph names
      // and it leads to opentype.js crash during saving phase
      // so we define them here to prevent it
      // more: https://github.com/opentypejs/opentype.js/issues/240
      .map(x => {
        if (x.name === undefined) x.name = `u${x.unicode}`;
        return x;
      });

    // sanitize font name
    // https://github.com/opentypejs/opentype.js/issues/155
    const subsetFontFamilyName = font.names.fontFamily.en
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, 29);

    const subsetFont = new opentype.Font({
      familyName: subsetFontFamilyName,
      styleName: font.names.fontSubfamily.en,
      unitsPerEm: font.unitsPerEm,
      ascender: font.ascender,
      descender: font.descender,
      glyphs: usefulGlyphs,
    });

    const subsetTTFBuffer = Buffer.from(subsetFont.toArrayBuffer());


    const prevTTFSize = Math.ceil(fs.statSync(srcTTFPath).size / 1024);
    const currentTTFSize = Math.ceil(subsetTTFBuffer.length / 1024);
    console.log(`TTF subset created. Stat: ${prevTTFSize} Kb → ${currentTTFSize} Kb (−${Math.floor(100 - currentTTFSize / prevTTFSize * 100)}%).`);

    fs.writeFileSync(`${destPathBase}.ttf`, subsetTTFBuffer);
    console.log('TTF created.');

    const subsetWOFFBuffer = Buffer.from(ttf2woff(new Uint8Array(subsetTTFBuffer)).buffer);
    fs.writeFileSync(`${destPathBase}.woff`, subsetWOFFBuffer);
    console.log('WOFF created.');

    const subsetWOFF2Buffer = ttf2woff2(subsetTTFBuffer);
    fs.writeFileSync(`${destPathBase}.woff2`, subsetWOFF2Buffer);
    console.log('WOFF2 created.');

    const className = `${key.replace(/\s*/g, '')}--${filebasename}`;

    // we don't need TTF because WOFF/2 are widely supported:
    // https://caniuse.com/#search=woff
    // https://caniuse.com/#search=woff2
    // but IE11 can't validate our “semibroken” WOFF, but can do it with TTF
    // so TTF here is a fallback for IE11 and should be removed
    // ~if~ when we drop IE11 support
    fontStyles.push(`
      @font-face {
        src: url('${key}/${filebasename}.woff2') format('woff2'), url('${key}/${filebasename}.woff') format('woff'), url('${key}/${filebasename}.ttf') format('truetype');
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
  src: url('${filebasename}.woff2') format('woff2'), url('${filebasename}.woff') format('woff'), url('${filebasename}.ttf') format('truetype');
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

const fontTableRows = CHARACTERS.reduce((rows, x) => {
  if (rows[rows.length - 1].length === 32) { // max 32 cells in a row
    rows.push([]);
  }

  const title = `U+${x.toString(16).toUpperCase().padStart(4, '0')} | ${x}`;
  let character = String.fromCharCode(x);

  if (character === '<') character = '&lt;';

  rows[rows.length - 1].push(`<td title="${title}">${character}</td>`);

  return rows;
}, [[]])
  .map(row => `<tr>${row.join('\n')}</tr>`);

const template = fs.readFileSync(`${__dirname}/templates/index.html`, 'utf8')
  .replace('#FONT_STYLES#', fontStyles.join('\n'))
  .replace('#FONT_OPTIONS#', fontOptions.join('\n'))
  .replace('#FONT_TABLE_ROWS#', fontTableRows.join('\n'));

fs.writeFileSync(`${DIST_DIR}/index.html`, template);

console.log('------------------------');

console.log('Demo page generated.');
