#!/bin/sh
set -eu

pip install --quiet --root-user-action=ignore fonttools brotli

SOURCE=node_modules
TARGET=src/assets/fonts
UNICODES="U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-203A,U+20AC,U+2190-21FF,U+2212,U+2318"
FEATURES="kern,liga,calt,case,tnum,locl"
WORK=$(mktemp -d)

mkdir -p "$TARGET"

subset() {
  pyftsubset "$1" --unicodes="$UNICODES" --layout-features="$FEATURES" --flavor=woff2 --output-file="$2"
  echo "$2 $(wc -c < "$2") bytes"
}

python -m fontTools.varLib.instancer --quiet \
  "$SOURCE/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2" wght=400:600 -o "$WORK/geist.ttf"
subset "$WORK/geist.ttf" "$TARGET/geist.woff2"

python -m fontTools.varLib.instancer --quiet \
  "$SOURCE/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2" wght=400:500 -o "$WORK/geist-mono.ttf"
subset "$WORK/geist-mono.ttf" "$TARGET/geist-mono.woff2"

subset "$SOURCE/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2" "$TARGET/instrument-serif-italic.woff2"
