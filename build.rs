use std::process::Command;

static DOOM_SRC: &str = "linuxdoom-1.10";
static LIBC_SRC: &str = "musl-1.2.2";
static LIBGCC_SRC: &str = "clang_compiler_rt";

fn main() {
    // Original Doom sources
    println!("cargo:rerun-if-changed={}", DOOM_SRC);
    let status = Command::new("make")
        .args(&["-C", DOOM_SRC, "linux/liblinuxxdoom.a"])
        .status()
        .expect("failed to start doom make");
    if !status.success(){
        panic!("Failed to make: {}", status);
    }
    println!("cargo:rustc-link-search={}/linux", DOOM_SRC);
    println!("cargo:rustc-link-lib=linuxxdoom");

    // musl libc
    println!("cargo:rerun-if-changed={}", LIBC_SRC);
    let status = Command::new("make")
        .args(&["-C", LIBC_SRC, "lib/libc.a"])
        .status()
        .expect("failed to start musl libc make");
    if !status.success(){
        panic!("Failed to make: {}", status);
    }
    println!("cargo:rustc-link-search={}/lib/", LIBC_SRC);
    println!("cargo:rustc-link-lib=c");

    // compiler runtime, with e.g., floating point functions
    println!("cargo:rerun-if-changed={}", LIBGCC_SRC);
    let status = Command::new("make")
        .args(&["-C", LIBGCC_SRC, "build/libclang_rt.builtins-wasm32.a"])
        .status()
        .expect("failed to start compiler_rt make");
    if !status.success(){
        panic!("Failed to make: {}", status);
    }
    println!("cargo:rustc-link-search={}/build", LIBGCC_SRC);
    println!("cargo:rustc-link-lib=clang_rt.builtins-wasm32");

    // libraries which should be removed before going to wasm
    // println!("cargo:rustc-link-lib=X11");
}