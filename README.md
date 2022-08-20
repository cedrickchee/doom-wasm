# Porting Linux DOOM to WebAssembly

We got vanilla Linux DOOM starting from Rust.

![DOOM starting via Cargo](imgs/doom_booting_x11_rust.png)

---

## libc

Getting musl

`AR=llvm-ar-10 CC=clang CFLAGS="-m32 --target=wasm32" ./configure --target=wasm32`

no `wasm32` arch support

Getting the arch from https://github.com/emscripten-core/emscripten/tree/efede793113ce1aa4d38d4f2df08e6b251cc53c6/system/lib/libc/musl/arch/emscripten

Throwing out everything which is complicated.

Crossover of musl 1.2.2 and arch from emscripten of musl 1.1.15.

Only need the string formatting functions anyway. Kicking out everything else.

Only making `make lib/libc.a`.
