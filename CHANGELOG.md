# Changelog

## 3.0.0 (02.05.2023)

Added `lnum` into the list of supported OpenType features.

No need to migrate anything, but your font files may become bigger a bit. 
Override `LAYOUT_FEATURES` config option if you want to turn some OpenType features off.


## 2.1.0 (11.10.2021)

Now it's possible to pass desired layout features using config file. 

List the features you want to keep using the `LAYOUT_FEATURES` config field. 
See the [default config](https://github.com/funbox/beatrix/blob/1c645bd42e686eb5818831be86f41003bc56ff0d/lib/default-config.js#L65) for example.


## 2.0.1 (10.06.2021)

Fixed several security vulnerabilities:

- [Use of a Broken or Risky Cryptographic Algorithm](https://github.com/advisories/GHSA-r9p9-mrjm-926w) in [elliptic](https://github.com/indutny/elliptic). Updated from 6.5.3 to 6.5.4.

- [Regular Expression Denial of Service](https://github.com/advisories/GHSA-43f8-2h32-f4cj) in [hosted-git-info](https://github.com/npm/hosted-git-info). Updated from 2.8.8 to 2.8.9.

- [Command Injection](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) in [lodash](https://github.com/lodash/lodash). Updated from 4.17.19 to 4.17.21.

- [Regular Expression Denial of Service](https://www.npmjs.com/advisories/1751) in [glob-parent](https://www.npmjs.com/package/glob-parent). Updated from 5.1.1 to 5.1.2.


## 2.0.0 (25.09.2020)

The package was fully refactored to make it ready to be published on GitHub.

As a result:
1. CLI was added.
2. Demo page generation was removed.
3. Styles files generation was removed.
4. Russian and other Cyrillic symbols were removed from the default config.
5. Font files loading scheme was highly simplified. Now the source directory may have any structure.

Finally, the MIT license file was added.

There is no migration guide for this update, because the purpose of the package was changed,
and 2.0.0 is a completely new thing.


## 1.2.0 (13.07.2020)

Added kern option into the list of enabled font features, to enhance font kerning.


## 1.1.0 (27.01.2020)

Added [tnum](https://docs.microsoft.com/en-us/typography/opentype/spec/features_pt#tag-tnum) option
into the list of enabled font features, to make `font-variant-numeric: tabular-nums` CSS rule work.


## 1.0.0 (16.01.2020)

Initial version.
