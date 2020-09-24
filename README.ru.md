![Логотип Беатрикс: слово “BEATRIX” разрезанное на две части катаной](logo-top.svg)

<div align="center">
  <b>Beatrix</b> chops off useless fonts parts and converts TTF/OTF files into WOFF & WOFF2
</div>

## Установка

Беатрикс — это обёртка вокруг Пайтон-скриптов из набора [fonttools](https://github.com/fonttools/fonttools).
Потому сперва нужно установить их и зависимости для них:

```sh
pip install fonttools zopfli brotli
```

А затем саму Беатрикс:

```sh
npm install --save @funboxteam/beatrix
```

Готово.

## Использование

Беатрикс ожидает, что вы передадите ей папку с TTF/OTF-файлами и конфигурационный файл с перечислением символов, 
которые нужно оставить в шрифтах.

Так, если вы склонируете этот репозиторий и установите всё неоходимое, сможете протестировать работу Беатрикс так:

```sh
beatrix --config ./example/config.js --output ./dist ./example
``` 

Она загрузит `./example/config.js`, найдёт все TTF/OTF-файлы внутри `./example`, оптимизирует их, конвертирует в WOFF и WOFF2,
и положит всё в `./dist`.

<details>
<summary>Вывод этой команды</summary>

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

### Конфигурационный файл

Конфиг — это JS- или JSON-файл, описывающий объект с ключом `CHARACTERS` и значением в виде массива, каждый элемент которого
описывает один или несколько Unicode-символов. Каждый Unicode-символ представлен в виде четырёх шестнадцатиричных цифр.   

Например:

```js
module.exports = {
  CHARACTERS: [
    // Описывает ряд символов с U+0020 по U+007E включительно.
    // А именно: пробел, !, ", #, $, %, &, ', (, ), *, +, запятую, 
    // -, точку, /, числа, :, ;, <, =, >, ?, @, A-Z, [, \, ], ^,
    // _, `, a-z, {, |, }, ~
    '0020-007E',

    // Один Unicode-символ
    // неразравный пробел
    '00A0',

    // Ещё один Unicode-символ
    // ©
    '00A9',
 
    // ...
  ]
}
```

Символы, описанные выше, будут оставлены в шрифтовых файлах (как и кернинговые пары для них), а остальные будут вырезаны.

## Мотивация

Пользователи тратят огромное количество времени на скачивание веб-ассетов: JS, CSS, изображения, шрифты и так далее.
Чтобы как-то уменьшить это время, разработчики сжимают ассеты, гзипают их, используют оптимизированные форматы для картинок и шрифтов.

Но иногда разработчики могут пойти ещё чуть дальше. Если у них есть права на используемые шрифты, 
то они могут оставить только те глифы, которые нужны на их сайтах. А остальные можно и вырезать.

Беатрикс как раз для этого и нужна.

[![Sponsored by FunBox](logo-bottom.svg)](https://funbox.ru)
