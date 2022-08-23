use std::process::Command;

static PRINTF_TEST_SRC: &str = ".";

fn main() {
    // Original Doom sources
    println!("cargo:rerun-if-changed={}", PRINTF_TEST_SRC);
    let status = Command::new("make")
        .args(&["-C", PRINTF_TEST_SRC, "libmain.a"])
        .status()
        .expect("failed to start printf_test make");
    if !status.success(){
        panic!("Failed to make: {}", status);
    }
    println!("cargo:rustc-link-search={}", PRINTF_TEST_SRC);
    println!("cargo:rustc-link-lib=main");
}