const CHARACTERS = [
  // space, !, ", #, $, %, &, ', (, ), *, +, comma, -, dot, /,
  // numbers, :, ;, <, =, >, ?, @, A-Z, [, \, ], ^, _, `, a-z,
  // {, |, }, ~
  '0020-007E',

  // non-breaking space
  '00A0',

  // ©
  '00A9',

  // soft hyphen
  '00AD',

  // middle dot (·)
  '00B7',

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

  // minus (−)
  '2212',
];

// OpenType features
// https://docs.microsoft.com/en-us/typography/opentype/spec/featurelist
const LAYOUT_FEATURES = ['tnum', 'kern'];

module.exports = {
  CHARACTERS,
  LAYOUT_FEATURES,
};
