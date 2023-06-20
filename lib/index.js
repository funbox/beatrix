const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_CONFIG = require('./default-config');

const DEFAULT_OUTPUT_DIR = './dist';

module.exports = beatrix;

function beatrix({ configPath, outputPath, typefacesDirPath }) {
  if (!typefacesDirPath) {
    throw new Error('You have to pass the path to dir with font files.');
  }

  configPath = configPath && getAbsPath(configPath);
  outputPath = getAbsPath(outputPath || DEFAULT_OUTPUT_DIR);
  typefacesDirPath = getAbsPath(typefacesDirPath);

  const config = configPath
    // it's fine here, we're loading user's config file
    // eslint-disable-next-line import/no-dynamic-require
    ? { ...DEFAULT_CONFIG, ...require(configPath) }
    : DEFAULT_CONFIG;

  const charactersCodes = config.CHARACTERS;
  const charactersString = charactersCodes.join(',');

  const features = config.LAYOUT_FEATURES;
  const featuresString = features.join(',');

  const fontFiles = loadFontFiles(typefacesDirPath);

  if (!fontFiles.length) {
    throw new Error(`Font files not found in ${typefacesDirPath}.`);
  }

  execFileSync('rm', ['-rf', outputPath]);
  fs.mkdirSync(outputPath);
  console.log('Output dir cleared.');

  fontFiles.forEach(srcTTFPath => {
    console.log('------------------------');
    console.log(`Start processing '${srcTTFPath}'...`);

    const srcDirPath = path.dirname(srcTTFPath);
    const destDirPath = srcDirPath.replace(typefacesDirPath, outputPath);

    const srcFilename = path.basename(srcTTFPath, path.extname(srcTTFPath));
    const destPathBase = path.join(destDirPath, srcFilename);

    fs.mkdirSync(destDirPath, { recursive: true });
    console.log(`Dest dir created: '${destDirPath}'.`);

    const destPathTTF = `${destPathBase}.ttf`;
    const destPathWOFF = `${destPathBase}.woff`;
    const destPathWOFF2 = `${destPathBase}.woff2`;

    // we don't need TTF to inject on webpages, but generate it
    // just because we can
    convert(srcTTFPath, destPathTTF, charactersString, featuresString);

    console.log(`TTF subset: ${buildTTFSubsetStat(srcTTFPath, destPathTTF)}`);
    console.log('TTF created.');

    convert(srcTTFPath, destPathWOFF, charactersString, featuresString);
    console.log('WOFF created.');

    convert(srcTTFPath, destPathWOFF2, charactersString, featuresString);
    console.log('WOFF2 created.');

    console.log(`Completed processing '${srcTTFPath}'.`);
  });

  console.log('------------------------');

  console.log('Done.');
}

function convert(src, dest, charactersString, featuresString) {
  const args = [
    // input file
    src,

    // output file
    `--output-file=${dest}`,

    // flavour of output font file. may be 'woff' or 'woff2'
    ...(dest.match(/\.woff$/) ? ['--flavor=woff'] : []),
    ...(dest.match(/\.woff2$/) ? ['--flavor=woff2'] : []),

    // use the google zopfli algorithm to compress WOFF.
    // the output is 3-8% smaller than pure zlib, but the compression speed is
    // much slower
    ...(dest.match(/\.woff$/) ? ['--with-zopfli'] : []),

    // OpenType features, e.g., `kern`, `liga`, `tnum`, etc.
    // https://docs.microsoft.com/en-us/typography/opentype/spec/featurelist
    `--layout-features=${featuresString}`,

    // make the font unusable as a system font by replacing name IDs 1, 2, 3, 4,
    // and 6 with dummy strings (it is still fully functional as webfont)
    '--obfuscate-names',

    // comma/whitespace-separated list of Unicode codepoints or ranges
    // as hex numbers, optionally prefixed with 'U+', 'u', etc.
    // example: --unicodes=U+0041-005A,U+0061-007A
    `--unicodes=${charactersString}`,
  ];

  execFileSync('pyftsubset', args);
}

function loadFontFiles(dir) {
  if (dir.startsWith('.')) return [];

  try {
    return fs.readdirSync(dir).reduce((acc, p) => acc.concat(loadFontFiles(path.join(dir, p))), []);
  } catch (err) {
    if (err.code === 'ENOTDIR') {
      return isFontFile(dir) ? [dir] : [];
    }

    return [];
  }
}

function isFontFile(filepath) {
  return filepath.endsWith('.ttf') || filepath.endsWith('.otf');
}

function buildTTFSubsetStat(srcTTFPath, destPathTTF) {
  const prevTTFSize = Math.ceil(fs.statSync(srcTTFPath).size / 1024);
  const currentTTFSize = Math.ceil(fs.statSync(destPathTTF).size / 1024);

  return `${prevTTFSize} Kb → ${currentTTFSize} Kb (−${Math.floor(100 - currentTTFSize / prevTTFSize * 100)}%).`;
}

function getAbsPath(p) {
  return path.resolve(process.cwd(), p);
}
