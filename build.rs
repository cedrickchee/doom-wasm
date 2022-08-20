fn main() {
    // TODO: go to linuxdoom-1.10 and `make linux/liblinuxxdoom.a` first
    println!("cargo:rustc-link-search=linuxdoom-1.10/linux");
    println!("cargo:rustc-link-lib=linuxxdoom");


    // libraries which should be removed before going to wasm
    println!("cargo:rustc-link-lib=Xext");
    println!("cargo:rustc-link-lib=X11");
    println!("cargo:rustc-link-lib=nsl");
    println!("cargo:rustc-link-lib=m");
}