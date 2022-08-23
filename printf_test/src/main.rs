use std::ffi::CStr;
use std::os::raw::{c_char};

// C libraries
extern "C" {
    fn c_main();
}

// JavaScript
#[link(wasm_import_module = "env")]
extern "C" {
    fn console_log(ptr: *const u8, len: usize);
}


macro_rules! log {
    ($($arg:tt)*) => {
        let __the_log_str = format!( $( $arg )* );
        unsafe { console_log(__the_log_str.as_ptr(), __the_log_str.len()) }
    }
}

macro_rules! println { ($($arg:tt),*) => { log!( $( $arg )* ) }; }
macro_rules! print { ($($arg:tt),*) => { log!( $( $arg )* ) }; }

#[no_mangle]
extern "C" fn hello_from_rust(name: *const c_char) {
    let name = unsafe { CStr::from_ptr(name) };
    let name = name.to_str().expect("invalid UTF8 hello_from_rust call");
    log!("Hello, \"{}\", nice to meet you!", name);
}

fn main() {
    std::panic::set_hook(Box::new(|panic_info| {
        log!("PANIC!!");
        let p = match panic_info.payload().downcast_ref::<&str>() {
            Some(s) => s.to_string(),
            None => String::from("<no further information>"),
        };
        let l = match panic_info.location() {
            Some(l) => format!("in file '{}' at line {}", l.file(), l.line()),
            None => String::from("but can't get location information..."),
        };
        log!("panic occurred: \"{}\" {}", p, l);
    }));
    
    println!("Hello, world from rust!");
    unsafe { c_main(); }
}