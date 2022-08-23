wat2wasm:=/home/neo/dev/scratch/github/WebAssembly/wabt/build/wat2wasm
wasm2wat:=/home/neo/dev/scratch/github/WebAssembly/wabt/build/wasm2wat
wasm-interp:=/home/neo/dev/scratch/github/WebAssembly/wabt/build/wasm-interp
wasm-opt:=/home/neo/dev/scratch/github/WebAssembly/binaryen/bin/wasm-opt
entr:=/home/neo/dev/scratch/github/eradman/entr/entr

BUILDDIR = target/wasm32-unknown-unknown/release

xdoom.wasm: src/*.rs clang_compiler_rt/* linuxdoom-1.10/*  musl-1.2.2/*
	cargo build --release
	
	# As log as wasm-ld does not look like it supports LTO for C/Rust
	# cross-language LTO, binaryen is the best we have. TODO: use
	# https://doc.rust-lang.org/rustc/linker-plugin-lto.html once it works for
	# wasm.  
	$(wasm-opt) -O3 -o xdoom.wasm ${BUILDDIR}/xdoom.wasm

run_wasm: xdoom.wasm
	ls xdoom.wasm | $(entr) -r python3 -m http.server --bind 127.0.0.1 8080

clean:
	cargo clean
	rm -rf xdoom.wasm
	make -C linuxdoom-1.10 clean
	make -C musl-1.2.2 clean