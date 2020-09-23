# @funboxteam/beatrix

## Description

A set of tools to convert and optimize fonts.

## Installation

```sh
npm install --save @funboxteam/beatrix
```

## Dependencies

To make everything work one should have `pyftsubset` installed. 
It's distributed in [fonttools](https://github.com/fonttools/fonttools).

At the same time, the `pyftsubset` uses Python packages `zopfli` and `brotli`,
so they should be installed too.

```sh
python3 -m pip install fonttools zopfli brotli
```

(If Python 3+ is used as the main Python version in the one's OS, 
the packages may be installed using `pip`.)

After than one may use two scripts:

1. `npm run build` builds fonts and demo pages.
2. `npm run demo` runs dev server on 0.0.0.0:5000 with demo page.