# @funboxteam/beatrix

## Описание

Набор инструментов для конвертации и оптимизации шрифтов.

## Установка

```sh
npm install --save @funboxteam/beatrix
```

## Зависимости

Для работы с файлами шрифтов используется `pyftsubset` из 
[fonttools](https://github.com/fonttools/fonttools). Сам `pyftsubset` использует 
Python-пакеты `zopfli` и `brotli`, потому нужно установить их всех перед началом
разработки:

```sh
python3 -m pip install fonttools zopfli brotli
```

(Если в системе используется Python версии 3 и выше по умолчанию, то можно 
устанавливать напрямую через `pip`.)

Далее можно оперировать двумя скриптами:

1. `npm run build` собирает шрифты и демо-страницу.
2. `npm run demo` поднимает дев-сервер на 0.0.0.0:5000 с демо-страницей.
