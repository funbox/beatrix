const CHARACTERS = [
  // space, !, ", #, $, %, &, ', (, ), *, +, comma, -, dot, /,
  // numbers, :, ;, <, =, >, ?, @, A-Z, [, \, ], ^, _, `, a-z,
  // {, |, }, ~
  ...range(0x0020, 0x007E),

  // non-breaking space
  0x00A0,

  // ©
  0x00A9,

  // «
  0x00AB,

  // »
  0x00BB,

  // soft hyphen
  0x00AD,

  // middle dot (·)
  0x00B7,

  // Ё
  0x0401,

  // А-Я, а-я
  ...range(0x0410, 0x044F),

  // ё
  0x0451,

  // en space
  0x2002,

  // em space
  0x2003,

  // thin space
  0x2009,

  // hair space
  0x200A,

  // hyphen (-)
  0x2010,

  // non-breaking hyphen
  0x2011,

  // en dash (–)
  0x2013,

  // em dash (—)
  0x2014,

  // ‘, ’, ‚ (single low-9 quotation mark), ‛, “, ”, „, ‟
  ...range(0x2018, 0x201F),

  // bullet (•)
  0x2022,

  // ellipsis (…)
  0x2026,

  // narrow non-breaking space
  0x202F,

  // rouble sign (₽)
  0x20BD,

  // minus (−)
  0x2212,
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

// [start, end]
function range(start, end) {
  return new Array(end - start + 1).fill(1).map((x, i) => start + i);
}
