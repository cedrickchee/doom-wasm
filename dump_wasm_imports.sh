#!/bin/sh

wasm2wat=/home/neo/dev/scratch/github/WebAssembly/wabt/build/wasm2wat

# apt install wabt
$wasm2wat "${1}" | grep '\(import \|export \)'