use std::process::Command;

static DOOM_SRC: &str = "linuxdoom-1.10";

fn main() {
    println!("cargo:rerun-if-changed={}", DOOM_SRC);

    let build_status = Command::new("make")
        .args(&["-C", DOOM_SRC])
        .status()
        .expect("failed to start make");
    if !build_status.success(){
        panic!("make failed to build: {}", build_status);
    }

    let ar_status = Command::new("make")
        .args(&["-C", DOOM_SRC, "linux/liblinuxxdoom.a"])
        .status()
        .expect("failed to start make");
    if !ar_status.success(){
        panic!("make failed to compile to static lib: {}", ar_status);
    }

    println!("cargo:rustc-link-search={}/linux", DOOM_SRC);
    println!("cargo:rustc-link-lib=linuxxdoom");

    // libraries which should be removed before going to wasm
    println!("cargo:rustc-link-lib=X11");
}