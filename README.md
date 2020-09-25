![Beatrix logo: “BEATRIX” cut into two pieces by katana](logo-top.svg)

<div align="center">
  <b>Beatrix</b> chops off useless fonts parts and converts TTF/OTF files into WOFF & WOFF2
</div> 

## Rationale

Users spend a lot of time downloading web assets: JS, CSS, images, fonts, etc.
To reduce waiting time, developers compress the assets, gzip them, use optimized formats for images and fonts.

But sometimes the developers can go a little bit further. When they have all the rights for fonts they use,
it's possible to leave only the glyphs their website needs. Just cut off the rest ones.

That's exactly how the tool works.

## Getting Started

[По-русски](./README.ru.md)

First of all, the tool is a wrapper around Python scripts distributed as [fonttools](https://github.com/fonttools/fonttools).
You should install them and the deps they need to:

```sh
pip install fonttools zopfli brotli
```

Then you can install Beatrix:

```sh
npm install --save @funboxteam/beatrix
```

Now you're ready to optimize your fonts.

## Usage

Beatrix expects to get a path to directory with TTF/OTF files inside and the config with allowed characters listed.

E.g. if you clone this repo and install the tool, you will be able to run it like this:

```sh
beatrix --config ./example/config.js --output ./dist ./example
``` 

It will load `./example/config.js`, find all the TTF/OTF files inside `./example`, optimize & convert them to WOFF & WOFF2,
and put the results into `./dist`.

<details>
<summary>The output of this command</summary>

```text
$ beatrix --config ./example/config.js --output ./dist ./example
Output dir cleared.
------------------------
Start processing '/tmp/beatrix/example/Roboto/bold--italic.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 171 Kb → 33 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/bold--italic.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/bold.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 167 Kb → 32 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/bold.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/light--italic.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 173 Kb → 34 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/light--italic.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/light.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 167 Kb → 32 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/light.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/regular--italic.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 170 Kb → 33 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/regular--italic.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/regular.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 168 Kb → 32 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/regular.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/thin--italic.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 172 Kb → 34 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/thin--italic.ttf'.
------------------------
Start processing '/tmp/beatrix/example/Roboto/thin.ttf'...
Dest dir created: '/tmp/beatrix/dist/Roboto'.
TTF subset: 168 Kb → 32 Kb (−80%).
TTF created.
WOFF created.
WOFF2 created.
Completed processing '/tmp/beatrix/example/Roboto/thin.ttf'.
------------------------
Done.
```
</details>

### Config file

Config is a JS or JSON file which describes an object containing `CHARACTERS` array, where each item is a string
describing one Unicode number or a range of them. Each Unicode number is represented as 4 hex digits.

Example:

```js
module.exports = {
  CHARACTERS: [
    // Unicode range from U+0020 to U+007E (including the last one).
    // Contains: space, !, ", #, $, %, &, ', (, ), *, +, comma, 
    // -, dot, /, numbers, :, ;, <, =, >, ?, @, A-Z, [, \, ], ^,
    // _, `, a-z, {, |, }, ~
    '0020-007E',

    // One Unicode number
    // non-breaking space
    '00A0',

    // One more Unicode number
    // ©
    '00A9',
 
    // ...
  ]
}
```

The characters described above will be left in the font files (as well as kerning pairs for them), the other ones will be cut off.

[![Sponsored by FunBox](logo-bottom.svg)](https://funbox.ru)
