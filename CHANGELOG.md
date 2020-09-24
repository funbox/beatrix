# Changelog

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
