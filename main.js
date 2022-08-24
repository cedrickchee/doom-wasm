'use strict';
var memory = new WebAssembly.Memory({ initial : 108 });

const output = document.getElementById("output");

function readWasmString(offset, length) {
  const bytes = new Uint8Array(memory.buffer, offset, length);
  return new TextDecoder('utf8').decode(bytes);
}

function consoleLogString(offset, length) {
  const string = readWasmString(offset, length);
  console.log("\"" + string + "\"");
}

function appendOutput(style) {
  return function(offset, length) {
    const lines = readWasmString(offset, length).split('\n');
    for (var i=0; i<lines.length; ++i) {
      if (lines[i].length == 0) {
        continue;
      }
      var t = document.createElement("span");
      t.classList.add(style);
      t.appendChild(document.createTextNode(lines[i]));
      output.appendChild(t);
      output.appendChild(document.createElement("br"));
      t.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"}); /*smooth scrolling is experimental according to MDN*/
    }
  }
}

const getmsps_stats = document.getElementById("getmsps_stats");
const getms_stats = document.getElementById("getms_stats");
var getms_calls_total = 0;
var getms_calls = 0; // in current second
window.setInterval(function() {
    getms_calls_total += getms_calls;
    getmsps_stats.innerText = getms_calls/1000 + "k";
    getms_stats.innerText = getms_calls_total;
    getms_calls = 0;
}, 1000);

// Implement libC `gettimeofday`.
//
// This is one of the few functions where we need support from JavaScript,
// since WebAssembly does not know about the date or about wall-clock
// timers in general.
//
// Doom uses `gettimeofday` to compute when its "ticks" are happening, so
// the game runs at the same speed on slow as well as on fast hardware.

// function  getTimeOfDay(ptr) {
//   gettimeofday_stats.innerText = parseInt(gettimeofday_stats.innerText) + 1;
//   var timeval = new Uint32Array(memory.buffer, ptr, 2);
//   // TODO: maybe wait for animation frame or make more efficient? Doom polls this quite often!
//   // Since Doom does not really care about the absolute wall clock, but
//   // only wants time differences, maybe window.performance.now() would be
//   // better here??
//   const t = new Date();
//   timeval[0] = t.getSeconds();
//   timeval[1] = t.getMilliseconds() * 1000; // as usec YOLO; Doom wants 1/70th second tics, so we should be fine.
// }

function getMilliseconds() {
  ++getms_calls;
  return performance.now();
}

// Show more stats such as FPS
const fps_stats = document.getElementById("fps_stats");
const drawframes_stats = document.getElementById("drawframes_stats");
var numberOfDraws = 0;
window.setInterval(function() {
  drawframes_stats.innerText = parseInt(drawframes_stats.innerText) + numberOfDraws;
  fps_stats.innerText = numberOfDraws;
  numberOfDraws = 0;
}, 1000);

// Render Doom screen

const canvas = document.getElementById('screen');
const doom_screen_width = 320*2;
const doom_screen_height = 200*2;

function drawCanvas(ptr) {
  // console.log("drawCanvas - ptr:", ptr);
  var doom_screen = new Uint8Array(memory.buffer, ptr, doom_screen_width*doom_screen_height*4);
  var ctx = canvas.getContext('2d');
  var render_screen = ctx.createImageData(doom_screen_width, doom_screen_height);

  for (var i=0; i < doom_screen_width*doom_screen_height*4; ++i) {
    render_screen.data[i] = doom_screen[i]; // Is there some memcpy in JS?
  }

  ctx.putImageData(render_screen, 0, 0);

  ++numberOfDraws;
}

// WebAssembly specific stuffs

var importObject = {
  js: {
    js_console_log: appendOutput("log"),
    js_stdout: appendOutput("stdout"),
    js_stderr: appendOutput("stderr"),
    js_milliseconds_since_start: getMilliseconds,
    js_draw_screen: drawCanvas,
  },
  env: {
    memory: memory
  }
};

WebAssembly.instantiateStreaming(fetch('xdoom.wasm'), importObject)
  .then(obj => {
    // Initialize.
    obj.instance.exports.main();

    // Respond to keyboard input.
    //
    // Register JavaScript event listeners for key presses and insert the
    // corresponding key code into Doom's event queue.

    let doomKeyCode = function(keyCode) {
      // Doom seems to use mostly the same keycodes, except for the following (maybe I'm missing a few.)
      switch (keyCode) {
        case 8:
          return 127; // KEY_BACKSPACE
        case 17:
          return (0x80+0x1d); // KEY_RCTRL
        case 18:
          return (0x80+0x38); // KEY_RALT
        case 37:
          return 0xac; // KEY_LEFTARROW
        case 38:
          return 0xad; // KEY_UPARROW
        case 39:
          return 0xae; // KEY_RIGHTARROW
        case 40:
          return 0xaf; // KEY_DOWNARROW
        default:
          if (keyCode >= 65 /*A*/ && keyCode <= 90 /*Z*/) {
            return keyCode + 32; // ASCII to lower case
          }
          if (keyCode >= 112 /*F1*/ && keyCode <= 123 /*F12*/ ) {
            return keyCode + 75; // KEY_F1
          }
          return keyCode;
      }
    };

    document.addEventListener('keydown', function(event) {
      obj.instance.exports.add_browser_event(0 /*KeyDown*/, doomKeyCode(event.keyCode));
    });
    document.addEventListener('keyup', function(event) {
      obj.instance.exports.add_browser_event(1 /*KeyUp*/, doomKeyCode(event.keyCode));
    });

    // We've change Doom source code such that Doom itself is not looping,
    // but we can call the loop here via `window.requestAnimationFrame()`.
    function step(timestamp) {
      obj.instance.exports.doom_loop_step();
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  });