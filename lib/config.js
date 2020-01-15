const CHARACTERS = [
  // space, !, ", #, $, %, &, ', (, ), *, +, comma, -, dot, /,
  // numbers, :, ;, <, =, >, ?, @, A-Z, [, \, ], ^, _, `, a-z,
  // {, |, }, ~
  '0020-007E',

  // non-breaking space
  '00A0',

  // ©
  '00A9',

  // «
  '00AB',

  // »
  '00BB',

  // soft hyphen
  '00AD',

  // middle dot (·)
  '00B7',

  // Ё
  '0401',

  // А-Я, а-я
  '0410-044F',

  // ё
  '0451',

  // en space
  '2002',

  // em space
  '2003',

  // thin space
  '2009',

  // hair space
  '200A',

  // hyphen (-)
  '2010',

  // non-breaking hyphen
  '2011',

  // en dash (–)
  '2013',

  // em dash (—)
  '2014',

  // ‘, ’, ‚ (single low-9 quotation mark), ‛, “, ”, „
  '2018-201E',

  // bullet (•)
  '2022',

  // ellipsis (…)
  '2026',

  // narrow non-breaking space
  '202F',

  // rouble sign (₽)
  '20BD',

  // minus (−)
  '2212',
];

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

module.exports = {
  CHARACTERS,
  WEIGHTS,
};
