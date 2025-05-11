var Module = (() => {
  var _scriptName =
    typeof document != 'undefined' ? document.currentScript?.src : undefined;
  if (typeof __filename != 'undefined') _scriptName = _scriptName || __filename;
  return async function (moduleArg = {}) {
    var moduleRtn;

    var Module = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var ENVIRONMENT_IS_WEB = typeof window == 'object';
    var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
    var ENVIRONMENT_IS_NODE =
      typeof process == 'object' &&
      typeof process.versions == 'object' &&
      typeof process.versions.node == 'string' &&
      process.type != 'renderer';
    var ENVIRONMENT_IS_SHELL =
      !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    if (ENVIRONMENT_IS_NODE) {
    }
    var moduleOverrides = { ...Module };
    var arguments_ = [];
    var thisProgram = './this.program';
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var scriptDirectory = '';
    function locateFile(path) {
      if (Module['locateFile']) {
        return Module['locateFile'](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var readAsync, readBinary;
    if (ENVIRONMENT_IS_NODE) {
      if (
        typeof process == 'undefined' ||
        !process.release ||
        process.release.name !== 'node'
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      var nodeVersion = process.versions.node;
      var numericVersion = nodeVersion.split('.').slice(0, 3);
      numericVersion =
        numericVersion[0] * 1e4 +
        numericVersion[1] * 100 +
        numericVersion[2].split('-')[0] * 1;
      if (numericVersion < 16e4) {
        throw new Error(
          'This emscripten-generated code requires node v16.0.0 (detected v' +
            nodeVersion +
            ')'
        );
      }
      var fs = require('fs');
      var nodePath = require('path');
      scriptDirectory = __dirname + '/';
      readBinary = (filename) => {
        filename = isFileURI(filename) ? new URL(filename) : filename;
        var ret = fs.readFileSync(filename);
        assert(Buffer.isBuffer(ret));
        return ret;
      };
      readAsync = async (filename, binary = true) => {
        filename = isFileURI(filename) ? new URL(filename) : filename;
        var ret = fs.readFileSync(filename, binary ? undefined : 'utf8');
        assert(binary ? Buffer.isBuffer(ret) : typeof ret == 'string');
        return ret;
      };
      if (!Module['thisProgram'] && process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, '/');
      }
      arguments_ = process.argv.slice(2);
      quit_ = (status, toThrow) => {
        process.exitCode = status;
        throw toThrow;
      };
    } else if (ENVIRONMENT_IS_SHELL) {
      if (
        (typeof process == 'object' && typeof require === 'function') ||
        typeof window == 'object' ||
        typeof WorkerGlobalScope != 'undefined'
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != 'undefined' && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      if (scriptDirectory.startsWith('blob:')) {
        scriptDirectory = '';
      } else {
        scriptDirectory = scriptDirectory.slice(
          0,
          scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
        );
      }
      if (
        !(typeof window == 'object' || typeof WorkerGlobalScope != 'undefined')
      )
        throw new Error(
          'not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)'
        );
      {
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = async (url) => {
          if (isFileURI(url)) {
            return new Promise((resolve, reject) => {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, true);
              xhr.responseType = 'arraybuffer';
              xhr.onload = () => {
                if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                  resolve(xhr.response);
                  return;
                }
                reject(xhr.status);
              };
              xhr.onerror = reject;
              xhr.send(null);
            });
          }
          var response = await fetch(url, { credentials: 'same-origin' });
          if (response.ok) {
            return response.arrayBuffer();
          }
          throw new Error(response.status + ' : ' + response.url);
        };
      }
    } else {
      throw new Error('environment detection error');
    }
    var out = Module['print'] || console.log.bind(console);
    var err = Module['printErr'] || console.error.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    checkIncomingModuleAPI();
    if (Module['arguments']) arguments_ = Module['arguments'];
    legacyModuleProp('arguments', 'arguments_');
    if (Module['thisProgram']) thisProgram = Module['thisProgram'];
    legacyModuleProp('thisProgram', 'thisProgram');
    assert(
      typeof Module['memoryInitializerPrefixURL'] == 'undefined',
      'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['pthreadMainPrefixURL'] == 'undefined',
      'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['cdInitializerPrefixURL'] == 'undefined',
      'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['filePackagePrefixURL'] == 'undefined',
      'Module.filePackagePrefixURL option was removed, use Module.locateFile instead'
    );
    assert(
      typeof Module['read'] == 'undefined',
      'Module.read option was removed'
    );
    assert(
      typeof Module['readAsync'] == 'undefined',
      'Module.readAsync option was removed (modify readAsync in JS)'
    );
    assert(
      typeof Module['readBinary'] == 'undefined',
      'Module.readBinary option was removed (modify readBinary in JS)'
    );
    assert(
      typeof Module['setWindowTitle'] == 'undefined',
      'Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)'
    );
    assert(
      typeof Module['TOTAL_MEMORY'] == 'undefined',
      'Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY'
    );
    legacyModuleProp('asm', 'wasmExports');
    legacyModuleProp('readAsync', 'readAsync');
    legacyModuleProp('readBinary', 'readBinary');
    legacyModuleProp('setWindowTitle', 'setWindowTitle');
    assert(
      !ENVIRONMENT_IS_SHELL,
      'shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.'
    );
    var wasmBinary = Module['wasmBinary'];
    legacyModuleProp('wasmBinary', 'wasmBinary');
    if (typeof WebAssembly != 'object') {
      err('no native wasm support detected');
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort('Assertion failed' + (text ? ': ' + text : ''));
      }
    }
    var HEAP8,
      HEAPU8,
      HEAP16,
      HEAPU16,
      HEAP32,
      HEAPU32,
      HEAPF32,
      HEAP64,
      HEAPU64,
      HEAPF64;
    var runtimeInitialized = false;
    var isFileURI = (filename) => filename.startsWith('file://');
    function writeStackCookie() {
      var max = _emscripten_stack_get_end();
      assert((max & 3) == 0);
      if (max == 0) {
        max += 4;
      }
      HEAPU32[max >> 2] = 34821223;
      HEAPU32[(max + 4) >> 2] = 2310721022;
      HEAPU32[0 >> 2] = 1668509029;
    }
    function checkStackCookie() {
      if (ABORT) return;
      var max = _emscripten_stack_get_end();
      if (max == 0) {
        max += 4;
      }
      var cookie1 = HEAPU32[max >> 2];
      var cookie2 = HEAPU32[(max + 4) >> 2];
      if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort(
          `Stack overflow! Stack cookie has been overwritten at ${ptrToString(
            max
          )}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(
            cookie2
          )} ${ptrToString(cookie1)}`
        );
      }
      if (HEAPU32[0 >> 2] != 1668509029) {
        abort(
          'Runtime error: The application has corrupted its heap memory area (address zero)!'
        );
      }
    }
    (() => {
      var h16 = new Int16Array(1);
      var h8 = new Int8Array(h16.buffer);
      h16[0] = 25459;
      if (h8[0] !== 115 || h8[1] !== 99)
        throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    })();
    if (Module['ENVIRONMENT']) {
      throw new Error(
        'Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)'
      );
    }
    function legacyModuleProp(prop, newName, incoming = true) {
      if (!Object.getOwnPropertyDescriptor(Module, prop)) {
        Object.defineProperty(Module, prop, {
          configurable: true,
          get() {
            let extra = incoming
              ? ' (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)'
              : '';
            abort(
              `\`Module.${prop}\` has been replaced by \`${newName}\`` + extra
            );
          },
        });
      }
    }
    function consumedModuleProp(prop) {
      if (!Object.getOwnPropertyDescriptor(Module, prop)) {
        Object.defineProperty(Module, prop, {
          configurable: true,
          set() {
            abort(
              `Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`
            );
          },
        });
      }
    }
    function ignoredModuleProp(prop) {
      if (Object.getOwnPropertyDescriptor(Module, prop)) {
        abort(
          `\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`
        );
      }
    }
    function isExportedByForceFilesystem(name) {
      return (
        name === 'FS_createPath' ||
        name === 'FS_createDataFile' ||
        name === 'FS_createPreloadedFile' ||
        name === 'FS_unlink' ||
        name === 'addRunDependency' ||
        name === 'FS_createLazyFile' ||
        name === 'FS_createDevice' ||
        name === 'removeRunDependency'
      );
    }
    function hookGlobalSymbolAccess(sym, func) {}
    function missingGlobal(sym, msg) {
      hookGlobalSymbolAccess(sym, () => {
        warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
      });
    }
    missingGlobal('buffer', 'Please use HEAP8.buffer or wasmMemory.buffer');
    missingGlobal('asm', 'Please use wasmExports instead');
    function missingLibrarySymbol(sym) {
      hookGlobalSymbolAccess(sym, () => {
        var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
        var librarySymbol = sym;
        if (!librarySymbol.startsWith('_')) {
          librarySymbol = '$' + sym;
        }
        msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
        if (isExportedByForceFilesystem(sym)) {
          msg +=
            '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
        }
        warnOnce(msg);
      });
      unexportedRuntimeSymbol(sym);
    }
    function unexportedRuntimeSymbol(sym) {
      if (!Object.getOwnPropertyDescriptor(Module, sym)) {
        Object.defineProperty(Module, sym, {
          configurable: true,
          get() {
            var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
            if (isExportedByForceFilesystem(sym)) {
              msg +=
                '. Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you';
            }
            abort(msg);
          },
        });
      }
    }
    var runtimeDebug = true;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module['HEAP8'] = HEAP8 = new Int8Array(b);
      Module['HEAP16'] = HEAP16 = new Int16Array(b);
      Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
      Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
      Module['HEAP32'] = HEAP32 = new Int32Array(b);
      Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
      Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
      Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
      Module['HEAP64'] = HEAP64 = new BigInt64Array(b);
      Module['HEAPU64'] = HEAPU64 = new BigUint64Array(b);
    }
    assert(
      !Module['STACK_SIZE'],
      'STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time'
    );
    assert(
      typeof Int32Array != 'undefined' &&
        typeof Float64Array !== 'undefined' &&
        Int32Array.prototype.subarray != undefined &&
        Int32Array.prototype.set != undefined,
      'JS engine does not provide full typed array support'
    );
    assert(
      !Module['wasmMemory'],
      'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally'
    );
    assert(
      !Module['INITIAL_MEMORY'],
      'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically'
    );
    function preRun() {
      if (Module['preRun']) {
        if (typeof Module['preRun'] == 'function')
          Module['preRun'] = [Module['preRun']];
        while (Module['preRun'].length) {
          addOnPreRun(Module['preRun'].shift());
        }
      }
      consumedModuleProp('preRun');
      callRuntimeCallbacks(onPreRuns);
    }
    function initRuntime() {
      assert(!runtimeInitialized);
      runtimeInitialized = true;
      checkStackCookie();
      if (!Module['noFSInit'] && !FS.initialized) FS.init();
      TTY.init();
      wasmExports['__wasm_call_ctors']();
      FS.ignorePermissions = false;
    }
    function postRun() {
      checkStackCookie();
      if (Module['postRun']) {
        if (typeof Module['postRun'] == 'function')
          Module['postRun'] = [Module['postRun']];
        while (Module['postRun'].length) {
          addOnPostRun(Module['postRun'].shift());
        }
      }
      consumedModuleProp('postRun');
      callRuntimeCallbacks(onPostRuns);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    var runDependencyTracking = {};
    var runDependencyWatcher = null;
    function getUniqueRunDependency(id) {
      var orig = id;
      while (1) {
        if (!runDependencyTracking[id]) return id;
        id = orig + Math.random();
      }
    }
    function addRunDependency(id) {
      runDependencies++;
      Module['monitorRunDependencies']?.(runDependencies);
      if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (
          runDependencyWatcher === null &&
          typeof setInterval != 'undefined'
        ) {
          runDependencyWatcher = setInterval(() => {
            if (ABORT) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
              return;
            }
            var shown = false;
            for (var dep in runDependencyTracking) {
              if (!shown) {
                shown = true;
                err('still waiting on run dependencies:');
              }
              err(`dependency: ${dep}`);
            }
            if (shown) {
              err('(end of list)');
            }
          }, 1e4);
        }
      } else {
        err('warning: run dependency added without ID');
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module['monitorRunDependencies']?.(runDependencies);
      if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
      } else {
        err('warning: run dependency removed without ID');
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      Module['onAbort']?.(what);
      what = 'Aborted(' + what + ')';
      err(what);
      ABORT = true;
      if (runtimeInitialized) {
        ___trap();
      }
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    function createExportWrapper(name, nargs) {
      return (...args) => {
        assert(
          runtimeInitialized,
          `native function \`${name}\` called before runtime initialization`
        );
        var f = wasmExports[name];
        assert(f, `exported native function \`${name}\` not found`);
        assert(
          args.length <= nargs,
          `native function \`${name}\` called with ${args.length} args but expects ${nargs}`
        );
        return f(...args);
      };
    }
    var wasmBinaryFile;
    function findWasmBinary() {
      return locateFile('wasm.wasm');
    }
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw 'both async and sync fetching of the wasm failed';
    }
    async function getWasmBinary(binaryFile) {
      if (!wasmBinary) {
        try {
          var response = await readAsync(binaryFile);
          return new Uint8Array(response);
        } catch {}
      }
      return getBinarySync(binaryFile);
    }
    async function instantiateArrayBuffer(binaryFile, imports) {
      try {
        var binary = await getWasmBinary(binaryFile);
        var instance = await WebAssembly.instantiate(binary, imports);
        return instance;
      } catch (reason) {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        if (isFileURI(wasmBinaryFile)) {
          err(
            `warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`
          );
        }
        abort(reason);
      }
    }
    async function instantiateAsync(binary, binaryFile, imports) {
      if (
        !binary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isFileURI(binaryFile) &&
        !ENVIRONMENT_IS_NODE
      ) {
        try {
          var response = fetch(binaryFile, { credentials: 'same-origin' });
          var instantiationResult = await WebAssembly.instantiateStreaming(
            response,
            imports
          );
          return instantiationResult;
        } catch (reason) {
          err(`wasm streaming compile failed: ${reason}`);
          err('falling back to ArrayBuffer instantiation');
        }
      }
      return instantiateArrayBuffer(binaryFile, imports);
    }
    function getWasmImports() {
      return { env: wasmImports, wasi_snapshot_preview1: wasmImports };
    }
    async function createWasm() {
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmMemory = wasmExports['memory'];
        assert(wasmMemory, 'memory not found in wasm exports');
        updateMemoryViews();
        wasmTable = wasmExports['__indirect_function_table'];
        assert(wasmTable, 'table not found in wasm exports');
        removeRunDependency('wasm-instantiate');
        return wasmExports;
      }
      addRunDependency('wasm-instantiate');
      var trueModule = Module;
      function receiveInstantiationResult(result) {
        assert(
          Module === trueModule,
          'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?'
        );
        trueModule = null;
        return receiveInstance(result['instance']);
      }
      var info = getWasmImports();
      if (Module['instantiateWasm']) {
        return new Promise((resolve, reject) => {
          try {
            Module['instantiateWasm'](info, (mod, inst) => {
              receiveInstance(mod, inst);
              resolve(mod.exports);
            });
          } catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`);
            reject(e);
          }
        });
      }
      wasmBinaryFile ??= findWasmBinary();
      try {
        var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
        var exports = receiveInstantiationResult(result);
        return exports;
      } catch (e) {
        readyPromiseReject(e);
        return Promise.reject(e);
      }
    }
    class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }
    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module);
      }
    };
    var onPostRuns = [];
    var addOnPostRun = (cb) => onPostRuns.unshift(cb);
    var onPreRuns = [];
    var addOnPreRun = (cb) => onPreRuns.unshift(cb);
    var noExitRuntime = Module['noExitRuntime'] || true;
    var ptrToString = (ptr) => {
      assert(typeof ptr === 'number');
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };
    var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
        err(text);
      }
    };
    var UTF8Decoder =
      typeof TextDecoder != 'undefined' ? new TextDecoder() : undefined;
    var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          if ((u0 & 248) != 240)
            warnOnce(
              'Invalid UTF-8 leading byte ' +
                ptrToString(u0) +
                ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!'
            );
          u0 =
            ((u0 & 7) << 18) |
            (u1 << 12) |
            (u2 << 6) |
            (heapOrArray[idx++] & 63);
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
        }
      }
      return str;
    };
    var UTF8ToString = (ptr, maxBytesToRead) => {
      assert(
        typeof ptr == 'number',
        `UTF8ToString expects a number (got ${typeof ptr})`
      );
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    };
    var ___assert_fail = (condition, filename, line, func) =>
      abort(
        `Assertion failed: ${UTF8ToString(condition)}, at: ` +
          [
            filename ? UTF8ToString(filename) : 'unknown filename',
            line,
            func ? UTF8ToString(func) : 'unknown function',
          ]
      );
    var wasmTableMirror = [];
    var wasmTable;
    var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      assert(
        wasmTable.get(funcPtr) == func,
        'JavaScript-side Wasm function table mirror is out of date!'
      );
      return func;
    };
    var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);
    var getCppExceptionTag = () => wasmExports['__cpp_exception'];
    var getCppExceptionThrownObjectFromWebAssemblyException = (ex) => {
      var unwind_header = ex.getArg(getCppExceptionTag(), 0);
      return ___thrown_object_from_unwind_exception(unwind_header);
    };
    var stackSave = () => _emscripten_stack_get_current();
    var stackRestore = (val) => __emscripten_stack_restore(val);
    var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
    var getExceptionMessageCommon = (ptr) => {
      var sp = stackSave();
      var type_addr_addr = stackAlloc(4);
      var message_addr_addr = stackAlloc(4);
      ___get_exception_message(ptr, type_addr_addr, message_addr_addr);
      var type_addr = HEAPU32[type_addr_addr >> 2];
      var message_addr = HEAPU32[message_addr_addr >> 2];
      var type = UTF8ToString(type_addr);
      _free(type_addr);
      var message;
      if (message_addr) {
        message = UTF8ToString(message_addr);
        _free(message_addr);
      }
      stackRestore(sp);
      return [type, message];
    };
    var getExceptionMessage = (ex) => {
      var ptr = getCppExceptionThrownObjectFromWebAssemblyException(ex);
      return getExceptionMessageCommon(ptr);
    };
    Module['getExceptionMessage'] = getExceptionMessage;
    var ___throw_exception_with_stack_trace = (ex) => {
      var e = new WebAssembly.Exception(getCppExceptionTag(), [ex], {
        traceStack: true,
      });
      e.message = getExceptionMessage(e);
      throw e;
    };
    var __abort_js = () => abort('native code called abort()');
    var emnapiCtx = undefined;
    function __emnapi_get_last_error_info(
      env,
      error_code,
      engine_error_code,
      engine_reserved
    ) {
      var envObject = emnapiCtx.envStore.get(env);
      var lastError = envObject.lastError;
      var errorCode = lastError.errorCode;
      var engineErrorCode = lastError.engineErrorCode >>> 0;
      var engineReserved = lastError.engineReserved;
      HEAP32[error_code >> 2] = errorCode;
      HEAPU32[engine_error_code >> 2] = engineErrorCode;
      HEAPU32[engine_reserved >> 2] = engineReserved;
    }
    var runtimeKeepaliveCounter = 0;
    var __emscripten_runtime_keepalive_clear = () => {
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
    };
    var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      assert(
        typeof str === 'string',
        `stringToUTF8Array expects a string (got ${typeof str})`
      );
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | (u >> 6);
          heap[outIdx++] = 128 | (u & 63);
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | (u >> 12);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          if (u > 1114111)
            warnOnce(
              'Invalid Unicode code point ' +
                ptrToString(u) +
                ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).'
            );
          heap[outIdx++] = 240 | (u >> 18);
          heap[outIdx++] = 128 | ((u >> 12) & 63);
          heap[outIdx++] = 128 | ((u >> 6) & 63);
          heap[outIdx++] = 128 | (u & 63);
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
    var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      assert(
        typeof maxBytesToWrite == 'number',
        'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!'
      );
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
    var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
    var __tzset_js = (timezone, daylight, std_name, dst_name) => {
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      var extractZone = (timezoneOffset) => {
        var sign = timezoneOffset >= 0 ? '-' : '+';
        var absOffset = Math.abs(timezoneOffset);
        var hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
        var minutes = String(absOffset % 60).padStart(2, '0');
        return `UTC${sign}${hours}${minutes}`;
      };
      var winterName = extractZone(winterOffset);
      var summerName = extractZone(summerOffset);
      assert(winterName);
      assert(summerName);
      assert(
        lengthBytesUTF8(winterName) <= 16,
        `timezone name truncated to fit in TZNAME_MAX (${winterName})`
      );
      assert(
        lengthBytesUTF8(summerName) <= 16,
        `timezone name truncated to fit in TZNAME_MAX (${summerName})`
      );
      if (summerOffset < winterOffset) {
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    };
    var _emscripten_date_now = () => Date.now();
    var abortOnCannotGrowMemory = (requestedSize) => {
      abort(
        `Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`
      );
    };
    var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      abortOnCannotGrowMemory(requestedSize);
    };
    var ENV = {};
    var getExecutableName = () => thisProgram || './this.program';
    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        var lang =
          (
            (typeof navigator == 'object' &&
              navigator.languages &&
              navigator.languages[0]) ||
            'C'
          ).replace('-', '_') + '.UTF-8';
        var env = {
          USER: 'web_user',
          LOGNAME: 'web_user',
          PATH: '/',
          PWD: '/',
          HOME: '/home/web_user',
          LANG: lang,
          _: getExecutableName(),
        };
        for (var x in ENV) {
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var stringToAscii = (str, buffer) => {
      for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      HEAP8[buffer] = 0;
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[(__environ + i * 4) >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => (bufSize += string.length + 1));
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    };
    var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
    var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module['onExit']?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };
    var exitJS = (status, implicit) => {
      EXITSTATUS = status;
      checkUnflushedContent();
      if (keepRuntimeAlive() && !implicit) {
        var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
        readyPromiseReject(msg);
        err(msg);
      }
      _proc_exit(status);
    };
    var _exit = exitJS;
    var PATH = {
      isAbs: (path) => path.charAt(0) === '/',
      splitPath: (filename) => {
        var splitPathRe =
          /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
      normalizeArray: (parts, allowAboveRoot) => {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
      normalize: (path) => {
        var isAbsolute = PATH.isAbs(path),
          trailingSlash = path.slice(-1) === '/';
        path = PATH.normalizeArray(
          path.split('/').filter((p) => !!p),
          !isAbsolute
        ).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
      dirname: (path) => {
        var result = PATH.splitPath(path),
          root = result[0],
          dir = result[1];
        if (!root && !dir) {
          return '.';
        }
        if (dir) {
          dir = dir.slice(0, -1);
        }
        return root + dir;
      },
      basename: (path) => path && path.match(/([^\/]+|\/)\/*$/)[1],
      join: (...paths) => PATH.normalize(paths.join('/')),
      join2: (l, r) => PATH.normalize(l + '/' + r),
    };
    var initRandomFill = () => {
      if (ENVIRONMENT_IS_NODE) {
        var nodeCrypto = require('crypto');
        return (view) => nodeCrypto.randomFillSync(view);
      }
      return (view) => crypto.getRandomValues(view);
    };
    var randomFill = (view) => {
      (randomFill = initRandomFill())(view);
    };
    var PATH_FS = {
      resolve: (...args) => {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = i >= 0 ? args[i] : FS.cwd();
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return '';
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        resolvedPath = PATH.normalizeArray(
          resolvedPath.split('/').filter((p) => !!p),
          !resolvedAbsolute
        ).join('/');
        return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
      },
      relative: (from, to) => {
        from = PATH_FS.resolve(from).slice(1);
        to = PATH_FS.resolve(to).slice(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
    };
    var FS_stdin_getChar_buffer = [];
    var intArrayFromString = (stringy, dontAddNull, length) => {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(
        stringy,
        u8array,
        0,
        u8array.length
      );
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    };
    var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
          var fd = process.stdin.fd;
          try {
            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
          } catch (e) {
            if (e.toString().includes('EOF')) bytesRead = 0;
            else throw e;
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString('utf-8');
          }
        } else if (
          typeof window != 'undefined' &&
          typeof window.prompt == 'function'
        ) {
          result = window.prompt('Input: ');
          if (result !== null) {
            result += '\n';
          }
        } else {
        }
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
    var TTY = {
      ttys: [],
      init() {},
      shutdown() {},
      register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
      stream_ops: {
        open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
        close(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
        fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
        read(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset + i] = result;
          }
          if (bytesRead) {
            stream.node.atime = Date.now();
          }
          return bytesRead;
        },
        write(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.mtime = stream.node.ctime = Date.now();
          }
          return i;
        },
      },
      default_tty_ops: {
        get_char(tty) {
          return FS_stdin_getChar();
        },
        put_char(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        fsync(tty) {
          if (tty.output?.length > 0) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
        ioctl_tcgets(tty) {
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
          };
        },
        ioctl_tcsets(tty, optional_actions, data) {
          return 0;
        },
        ioctl_tiocgwinsz(tty) {
          return [24, 80];
        },
      },
      default_tty1_ops: {
        put_char(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
        fsync(tty) {
          if (tty.output?.length > 0) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
      },
    };
    var mmapAlloc = (size) => {
      abort(
        'internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported'
      );
    };
    var MEMFS = {
      ops_table: null,
      mount(mount) {
        return MEMFS.createNode(null, '/', 16895, 0);
      },
      createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          throw new FS.ErrnoError(63);
        }
        MEMFS.ops_table ||= {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink,
            },
            stream: { llseek: MEMFS.stream_ops.llseek },
          },
          file: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync,
            },
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink,
            },
            stream: {},
          },
          chrdev: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
            },
            stream: FS.chrdev_stream_ops,
          },
        };
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0;
          node.contents = null;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.atime = node.mtime = node.ctime = Date.now();
        if (parent) {
          parent.contents[name] = node;
          parent.atime = parent.mtime = parent.ctime = node.atime;
        }
        return node;
      },
      getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray)
          return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents);
      },
      expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(
          newCapacity,
          (prevCapacity *
            (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
            0
        );
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0)
          node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
      },
      resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null;
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize);
          if (oldContents) {
            node.contents.set(
              oldContents.subarray(0, Math.min(newSize, node.usedBytes))
            );
          }
          node.usedBytes = newSize;
        }
      },
      node_ops: {
        getattr(node) {
          var attr = {};
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.atime);
          attr.mtime = new Date(node.mtime);
          attr.ctime = new Date(node.ctime);
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
        setattr(node, attr) {
          for (const key of ['mode', 'atime', 'mtime', 'ctime']) {
            if (attr[key] != null) {
              node[key] = attr[key];
            }
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
        lookup(parent, name) {
          throw new FS.ErrnoError(44);
        },
        mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
        rename(old_node, new_dir, new_name) {
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (new_node) {
            if (FS.isDir(old_node.mode)) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
            FS.hashRemoveNode(new_node);
          }
          delete old_node.parent.contents[old_node.name];
          new_dir.contents[new_name] = old_node;
          old_node.name = new_name;
          new_dir.ctime =
            new_dir.mtime =
            old_node.parent.ctime =
            old_node.parent.mtime =
              Date.now();
        },
        unlink(parent, name) {
          delete parent.contents[name];
          parent.ctime = parent.mtime = Date.now();
        },
        rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.ctime = parent.mtime = Date.now();
        },
        readdir(node) {
          return ['.', '..', ...Object.keys(node.contents)];
        },
        symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
          node.link = oldpath;
          return node;
        },
        readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
      },
      stream_ops: {
        read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) {
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++)
              buffer[offset + i] = contents[position + i];
          }
          return size;
        },
        write(stream, buffer, offset, length, position, canOwn) {
          assert(!(buffer instanceof ArrayBuffer));
          if (!length) return 0;
          var node = stream.node;
          node.mtime = node.ctime = Date.now();
          if (buffer.subarray && (!node.contents || node.contents.subarray)) {
            if (canOwn) {
              assert(
                position === 0,
                'canOwn must imply no weird position inside the file'
              );
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) {
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) {
              node.contents.set(
                buffer.subarray(offset, offset + length),
                position
              );
              return length;
            }
          }
          MEMFS.expandFileStorage(node, position + length);
          if (node.contents.subarray && buffer.subarray) {
            node.contents.set(
              buffer.subarray(offset, offset + length),
              position
            );
          } else {
            for (var i = 0; i < length; i++) {
              node.contents[position + i] = buffer[offset + i];
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
        llseek(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
        mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            if (contents) {
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(
                    contents,
                    position,
                    position + length
                  );
                }
              }
              HEAP8.set(contents, ptr);
            }
          }
          return { ptr, allocated };
        },
        msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          return 0;
        },
      },
    };
    var asyncLoad = async (url) => {
      var arrayBuffer = await readAsync(url);
      assert(
        arrayBuffer,
        `Loading data file "${url}" failed (no arrayBuffer).`
      );
      return new Uint8Array(arrayBuffer);
    };
    var FS_createDataFile = (
      parent,
      name,
      fileData,
      canRead,
      canWrite,
      canOwn
    ) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
    var preloadPlugins = Module['preloadPlugins'] || [];
    var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      if (typeof Browser != 'undefined') Browser.init();
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
    var FS_createPreloadedFile = (
      parent,
      name,
      url,
      canRead,
      canWrite,
      onload,
      onerror,
      dontCreateFile,
      canOwn,
      preFinish
    ) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`);
      function processData(byteArray) {
        function finish(byteArray) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(
              parent,
              name,
              byteArray,
              canRead,
              canWrite,
              canOwn
            );
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (
          FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
            onerror?.();
            removeRunDependency(dep);
          })
        ) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url).then(processData, onerror);
      } else {
        processData(url);
      }
    };
    var FS_modeStringToFlags = (str) => {
      var flagModes = {
        r: 0,
        'r+': 2,
        w: 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        a: 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
    var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
    var strError = (errno) => UTF8ToString(_strerror(errno));
    var ERRNO_CODES = {
      EPERM: 63,
      ENOENT: 44,
      ESRCH: 71,
      EINTR: 27,
      EIO: 29,
      ENXIO: 60,
      E2BIG: 1,
      ENOEXEC: 45,
      EBADF: 8,
      ECHILD: 12,
      EAGAIN: 6,
      EWOULDBLOCK: 6,
      ENOMEM: 48,
      EACCES: 2,
      EFAULT: 21,
      ENOTBLK: 105,
      EBUSY: 10,
      EEXIST: 20,
      EXDEV: 75,
      ENODEV: 43,
      ENOTDIR: 54,
      EISDIR: 31,
      EINVAL: 28,
      ENFILE: 41,
      EMFILE: 33,
      ENOTTY: 59,
      ETXTBSY: 74,
      EFBIG: 22,
      ENOSPC: 51,
      ESPIPE: 70,
      EROFS: 69,
      EMLINK: 34,
      EPIPE: 64,
      EDOM: 18,
      ERANGE: 68,
      ENOMSG: 49,
      EIDRM: 24,
      ECHRNG: 106,
      EL2NSYNC: 156,
      EL3HLT: 107,
      EL3RST: 108,
      ELNRNG: 109,
      EUNATCH: 110,
      ENOCSI: 111,
      EL2HLT: 112,
      EDEADLK: 16,
      ENOLCK: 46,
      EBADE: 113,
      EBADR: 114,
      EXFULL: 115,
      ENOANO: 104,
      EBADRQC: 103,
      EBADSLT: 102,
      EDEADLOCK: 16,
      EBFONT: 101,
      ENOSTR: 100,
      ENODATA: 116,
      ETIME: 117,
      ENOSR: 118,
      ENONET: 119,
      ENOPKG: 120,
      EREMOTE: 121,
      ENOLINK: 47,
      EADV: 122,
      ESRMNT: 123,
      ECOMM: 124,
      EPROTO: 65,
      EMULTIHOP: 36,
      EDOTDOT: 125,
      EBADMSG: 9,
      ENOTUNIQ: 126,
      EBADFD: 127,
      EREMCHG: 128,
      ELIBACC: 129,
      ELIBBAD: 130,
      ELIBSCN: 131,
      ELIBMAX: 132,
      ELIBEXEC: 133,
      ENOSYS: 52,
      ENOTEMPTY: 55,
      ENAMETOOLONG: 37,
      ELOOP: 32,
      EOPNOTSUPP: 138,
      EPFNOSUPPORT: 139,
      ECONNRESET: 15,
      ENOBUFS: 42,
      EAFNOSUPPORT: 5,
      EPROTOTYPE: 67,
      ENOTSOCK: 57,
      ENOPROTOOPT: 50,
      ESHUTDOWN: 140,
      ECONNREFUSED: 14,
      EADDRINUSE: 3,
      ECONNABORTED: 13,
      ENETUNREACH: 40,
      ENETDOWN: 38,
      ETIMEDOUT: 73,
      EHOSTDOWN: 142,
      EHOSTUNREACH: 23,
      EINPROGRESS: 26,
      EALREADY: 7,
      EDESTADDRREQ: 17,
      EMSGSIZE: 35,
      EPROTONOSUPPORT: 66,
      ESOCKTNOSUPPORT: 137,
      EADDRNOTAVAIL: 4,
      ENETRESET: 39,
      EISCONN: 30,
      ENOTCONN: 53,
      ETOOMANYREFS: 141,
      EUSERS: 136,
      EDQUOT: 19,
      ESTALE: 72,
      ENOTSUP: 138,
      ENOMEDIUM: 148,
      EILSEQ: 25,
      EOVERFLOW: 61,
      ECANCELED: 11,
      ENOTRECOVERABLE: 56,
      EOWNERDEAD: 62,
      ESTRPIPE: 135,
    };
    var FS = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: '/',
      initialized: false,
      ignorePermissions: true,
      filesystems: null,
      syncFSRequests: 0,
      readFiles: {},
      ErrnoError: class extends Error {
        name = 'ErrnoError';
        constructor(errno) {
          super(runtimeInitialized ? strError(errno) : '');
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
        }
      },
      FSStream: class {
        shared = {};
        get object() {
          return this.node;
        }
        set object(val) {
          this.node = val;
        }
        get isRead() {
          return (this.flags & 2097155) !== 1;
        }
        get isWrite() {
          return (this.flags & 2097155) !== 0;
        }
        get isAppend() {
          return this.flags & 1024;
        }
        get flags() {
          return this.shared.flags;
        }
        set flags(val) {
          this.shared.flags = val;
        }
        get position() {
          return this.shared.position;
        }
        set position(val) {
          this.shared.position = val;
        }
      },
      FSNode: class {
        node_ops = {};
        stream_ops = {};
        readMode = 292 | 73;
        writeMode = 146;
        mounted = null;
        constructor(parent, name, mode, rdev) {
          if (!parent) {
            parent = this;
          }
          this.parent = parent;
          this.mount = parent.mount;
          this.id = FS.nextInode++;
          this.name = name;
          this.mode = mode;
          this.rdev = rdev;
          this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return (this.mode & this.readMode) === this.readMode;
        }
        set read(val) {
          val ? (this.mode |= this.readMode) : (this.mode &= ~this.readMode);
        }
        get write() {
          return (this.mode & this.writeMode) === this.writeMode;
        }
        set write(val) {
          val ? (this.mode |= this.writeMode) : (this.mode &= ~this.writeMode);
        }
        get isFolder() {
          return FS.isDir(this.mode);
        }
        get isDevice() {
          return FS.isChrdev(this.mode);
        }
      },
      lookupPath(path, opts = {}) {
        if (!path) {
          throw new FS.ErrnoError(44);
        }
        opts.follow_mount ??= true;
        if (!PATH.isAbs(path)) {
          path = FS.cwd() + '/' + path;
        }
        linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
          var parts = path.split('/').filter((p) => !!p);
          var current = FS.root;
          var current_path = '/';
          for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
              break;
            }
            if (parts[i] === '.') {
              continue;
            }
            if (parts[i] === '..') {
              current_path = PATH.dirname(current_path);
              current = current.parent;
              continue;
            }
            current_path = PATH.join2(current_path, parts[i]);
            try {
              current = FS.lookupNode(current, parts[i]);
            } catch (e) {
              if (e?.errno === 44 && islast && opts.noent_okay) {
                return { path: current_path };
              }
              throw e;
            }
            if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
              current = current.mounted.root;
            }
            if (FS.isLink(current.mode) && (!islast || opts.follow)) {
              if (!current.node_ops.readlink) {
                throw new FS.ErrnoError(52);
              }
              var link = current.node_ops.readlink(current);
              if (!PATH.isAbs(link)) {
                link = PATH.dirname(current_path) + '/' + link;
              }
              path = link + '/' + parts.slice(i + 1).join('/');
              continue linkloop;
            }
          }
          return { path: current_path, node: current };
        }
        throw new FS.ErrnoError(32);
      },
      getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length - 1] !== '/'
              ? `${mount}/${path}`
              : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
      hashName(parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
      hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
      hashRemoveNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
      lookupNode(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        return FS.lookup(parent, name);
      },
      createNode(parent, name, mode, rdev) {
        assert(typeof parent == 'object');
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
      },
      destroyNode(node) {
        FS.hashRemoveNode(node);
      },
      isRoot(node) {
        return node === node.parent;
      },
      isMountpoint(node) {
        return !!node.mounted;
      },
      isFile(mode) {
        return (mode & 61440) === 32768;
      },
      isDir(mode) {
        return (mode & 61440) === 16384;
      },
      isLink(mode) {
        return (mode & 61440) === 40960;
      },
      isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
      isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
      isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
      isSocket(mode) {
        return (mode & 49152) === 49152;
      },
      flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if (flag & 512) {
          perms += 'w';
        }
        return perms;
      },
      nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
      mayLookup(dir) {
        if (!FS.isDir(dir.mode)) return 54;
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
      mayCreate(dir, name) {
        if (!FS.isDir(dir.mode)) {
          return 54;
        }
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {}
        return FS.nodePermissions(dir, 'wx');
      },
      mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
      mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || flags & (512 | 64)) {
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
      checkOpExists(op, err) {
        if (!op) {
          throw new FS.ErrnoError(err);
        }
        return op;
      },
      MAX_OPEN_FDS: 4096,
      nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
      getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
      getStream: (fd) => FS.streams[fd],
      createStream(stream, fd = -1) {
        assert(fd >= -1);
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
      closeStream(fd) {
        FS.streams[fd] = null;
      },
      dupStream(origStream, fd = -1) {
        var stream = FS.createStream(origStream, fd);
        stream.stream_ops?.dup?.(stream);
        return stream;
      },
      doSetAttr(stream, node, attr) {
        var setattr = stream?.stream_ops.setattr;
        var arg = setattr ? stream : node;
        setattr ??= node.node_ops.setattr;
        FS.checkOpExists(setattr, 63);
        setattr(arg, attr);
      },
      chrdev_stream_ops: {
        open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          stream.stream_ops = device.stream_ops;
          stream.stream_ops.open?.(stream);
        },
        llseek() {
          throw new FS.ErrnoError(70);
        },
      },
      major: (dev) => dev >> 8,
      minor: (dev) => dev & 255,
      makedev: (ma, mi) => (ma << 8) | mi,
      registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
      getDevice: (dev) => FS.devices[dev],
      getMounts(mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
          var m = check.pop();
          mounts.push(m);
          check.push(...m.mounts);
        }
        return mounts;
      },
      syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
          err(
            `warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`
          );
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(errCode) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(errCode);
        }
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        }
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
      mount(type, opts, mountpoint) {
        if (typeof type == 'string') {
          throw type;
        }
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
          mountpoint = lookup.path;
          node = lookup.node;
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
        var mount = { type, opts, mountpoint, mounts: [] };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          node.mounted = mount;
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
        return mountRoot;
      },
      unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
          while (current) {
            var next = current.name_next;
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
            current = next;
          }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },
      lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
      mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name) {
          throw new FS.ErrnoError(28);
        }
        if (name === '.' || name === '..') {
          throw new FS.ErrnoError(20);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
      statfs(path) {
        return FS.statfsNode(FS.lookupPath(path, { follow: true }).node);
      },
      statfsStream(stream) {
        return FS.statfsNode(stream.node);
      },
      statfsNode(node) {
        var rtn = {
          bsize: 4096,
          frsize: 4096,
          blocks: 1e6,
          bfree: 5e5,
          bavail: 5e5,
          files: FS.nextInode,
          ffree: FS.nextInode - 1,
          fsid: 42,
          flags: 2,
          namelen: 255,
        };
        if (node.node_ops.statfs) {
          Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
        }
        return rtn;
      },
      create(path, mode = 438) {
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
      mkdir(path, mode = 511) {
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
      mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var dir of dirs) {
          if (!dir) continue;
          if (d || PATH.isAbs(path)) d += '/';
          d += dir;
          try {
            FS.mkdir(d, mode);
          } catch (e) {
            if (e.errno != 20) throw e;
          }
        }
      },
      mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
      symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
      rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (old_node === new_node) {
          return;
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        errCode = new_node
          ? FS.mayDelete(new_dir, new_name, isdir)
          : FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (
          FS.isMountpoint(old_node) ||
          (new_node && FS.isMountpoint(new_node))
        ) {
          throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        FS.hashRemoveNode(old_node);
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
          old_node.parent = new_dir;
        } catch (e) {
          throw e;
        } finally {
          FS.hashAddNode(old_node);
        }
      },
      rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
      readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
        return readdir(node);
      },
      unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
      readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return link.node_ops.readlink(link);
      },
      stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
        return getattr(node);
      },
      fstat(fd) {
        var stream = FS.getStreamChecked(fd);
        var node = stream.node;
        var getattr = stream.stream_ops.getattr;
        var arg = getattr ? stream : node;
        getattr ??= node.node_ops.getattr;
        FS.checkOpExists(getattr, 63);
        return getattr(arg);
      },
      lstat(path) {
        return FS.stat(path, true);
      },
      doChmod(stream, node, mode, dontFollow) {
        FS.doSetAttr(stream, node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          ctime: Date.now(),
          dontFollow,
        });
      },
      chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doChmod(null, node, mode, dontFollow);
      },
      lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
      fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.doChmod(stream, stream.node, mode, false);
      },
      doChown(stream, node, dontFollow) {
        FS.doSetAttr(stream, node, { timestamp: Date.now(), dontFollow });
      },
      chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doChown(null, node, dontFollow);
      },
      lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
      fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.doChown(stream, stream.node, false);
      },
      doTruncate(stream, node, len) {
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.doSetAttr(stream, node, { size: len, timestamp: Date.now() });
      },
      truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doTruncate(null, node, len);
      },
      ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if (len < 0 || (stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.doTruncate(stream, stream.node, len);
      },
      utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
        setattr(node, { atime, mtime });
      },
      open(path, flags, mode = 438) {
        if (path === '') {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        if (flags & 64) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        var isDirPath;
        if (typeof path == 'object') {
          node = path;
        } else {
          isDirPath = path.endsWith('/');
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072),
            noent_okay: true,
          });
          node = lookup.node;
          path = lookup.path;
        }
        var created = false;
        if (flags & 64) {
          if (node) {
            if (flags & 128) {
              throw new FS.ErrnoError(20);
            }
          } else if (isDirPath) {
            throw new FS.ErrnoError(31);
          } else {
            node = FS.mknod(path, mode | 511, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        if (flags & 512 && !created) {
          FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          ungotten: [],
          error: false,
        });
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (created) {
          FS.chmod(node, mode & 511);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
      close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null;
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
      isClosed(stream) {
        return stream.fd === null;
      },
      llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
      read(stream, buffer, offset, length, position) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(
          stream,
          buffer,
          offset,
          length,
          position
        );
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
      write(stream, buffer, offset, length, position, canOwn) {
        assert(offset >= 0);
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(
          stream,
          buffer,
          offset,
          length,
          position,
          canOwn
        );
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
      mmap(stream, length, position, prot, flags) {
        if (
          (prot & 2) !== 0 &&
          (flags & 2) === 0 &&
          (stream.flags & 2097155) !== 2
        ) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        if (!length) {
          throw new FS.ErrnoError(28);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
      msync(stream, buffer, offset, length, mmapFlags) {
        assert(offset >= 0);
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(
          stream,
          buffer,
          offset,
          length,
          mmapFlags
        );
      },
      ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
      readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },
      writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
      cwd: () => FS.currentPath,
      chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
      createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
      createDefaultDevices() {
        FS.mkdir('/dev');
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
          llseek: () => 0,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        var randomBuffer = new Uint8Array(1024),
          randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomFill(randomBuffer);
            randomLeft = randomBuffer.byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
      createSpecialDirectories() {
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount(
          {
            mount() {
              var node = FS.createNode(proc_self, 'fd', 16895, 73);
              node.stream_ops = { llseek: MEMFS.stream_ops.llseek };
              node.node_ops = {
                lookup(parent, name) {
                  var fd = +name;
                  var stream = FS.getStreamChecked(fd);
                  var ret = {
                    parent: null,
                    mount: { mountpoint: 'fake' },
                    node_ops: { readlink: () => stream.path },
                    id: fd + 1,
                  };
                  ret.parent = ret;
                  return ret;
                },
                readdir() {
                  return Array.from(FS.streams.entries())
                    .filter(([k, v]) => v)
                    .map(([k, v]) => k.toString());
                },
              };
              return node;
            },
          },
          {},
          '/proc/self/fd'
        );
      },
      createStandardStreams(input, output, error) {
        if (input) {
          FS.createDevice('/dev', 'stdin', input);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (output) {
          FS.createDevice('/dev', 'stdout', null, output);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (error) {
          FS.createDevice('/dev', 'stderr', null, error);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
        assert(stdin.fd === 0, `invalid handle for stdin (${stdin.fd})`);
        assert(stdout.fd === 1, `invalid handle for stdout (${stdout.fd})`);
        assert(stderr.fd === 2, `invalid handle for stderr (${stderr.fd})`);
      },
      staticInit() {
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = { MEMFS };
      },
      init(input, output, error) {
        assert(
          !FS.initialized,
          'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
        );
        FS.initialized = true;
        input ??= Module['stdin'];
        output ??= Module['stdout'];
        error ??= Module['stderr'];
        FS.createStandardStreams(input, output, error);
      },
      quit() {
        FS.initialized = false;
        _fflush(0);
        for (var stream of FS.streams) {
          if (stream) {
            FS.close(stream);
          }
        }
      },
      findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
      analyzePath(path, dontResolveLastLink) {
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {}
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null,
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        }
        return ret;
      },
      createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            if (e.errno != 20) throw e;
          }
          parent = current;
        }
        return current;
      },
      createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(
          typeof parent == 'string' ? parent : FS.getPath(parent),
          name
        );
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
      createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i)
              arr[i] = data.charCodeAt(i);
            data = arr;
          }
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
      },
      createDevice(parent, name, input, output) {
        var path = PATH.join2(
          typeof parent == 'string' ? parent : FS.getPath(parent),
          name
        );
        var mode = FS_getMode(!!input, !!output);
        FS.createDevice.major ??= 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            if (output?.buffer?.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset + i] = result;
            }
            if (bytesRead) {
              stream.node.atime = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset + i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.mtime = stream.node.ctime = Date.now();
            }
            return i;
          },
        });
        return FS.mkdev(path, mode, dev);
      },
      forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
          return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error(
            'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
          );
        } else {
          try {
            obj.contents = readBinary(obj.url);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
      },
      createLazyFile(parent, name, url, canRead, canWrite) {
        class LazyUint8Array {
          lengthKnown = false;
          chunks = [];
          get(idx) {
            if (idx > this.length - 1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize) | 0;
            return this.getter(chunkNum)[chunkOffset];
          }
          setDataGetter(getter) {
            this.getter = getter;
          }
          cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (
              !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
            )
              throw new Error(
                "Couldn't load " + url + '. Status: ' + xhr.status
              );
            var datalength = Number(xhr.getResponseHeader('Content-length'));
            var header;
            var hasByteServing =
              (header = xhr.getResponseHeader('Accept-Ranges')) &&
              header === 'bytes';
            var usesGzip =
              (header = xhr.getResponseHeader('Content-Encoding')) &&
              header === 'gzip';
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = (from, to) => {
              if (from > to)
                throw new Error(
                  'invalid range (' +
                    from +
                    ', ' +
                    to +
                    ') or no bytes requested!'
                );
              if (to > datalength - 1)
                throw new Error(
                  'only ' + datalength + ' bytes available! programmer error!'
                );
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize)
                xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
              xhr.send(null);
              if (
                !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
              )
                throw new Error(
                  "Couldn't load " + url + '. Status: ' + xhr.status
                );
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              }
              return intArrayFromString(xhr.responseText || '', true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum + 1) * chunkSize - 1;
              end = Math.min(end, datalength - 1);
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined')
                throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
              chunkSize = datalength = 1;
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out(
                'LazyFiles on gzip forces download of the whole file when length is accessed'
              );
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          }
          get length() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          }
          get chunkSize() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          }
        }
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER)
            throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        Object.defineProperties(node, {
          usedBytes: {
            get: function () {
              return this.contents.length;
            },
          },
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = (...args) => {
            FS.forceLoadFile(node);
            return fn(...args);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length) return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position);
        };
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
      absolutePath() {
        abort('FS.absolutePath has been removed; use PATH_FS.resolve instead');
      },
      createFolder() {
        abort('FS.createFolder has been removed; use FS.mkdir instead');
      },
      createLink() {
        abort('FS.createLink has been removed; use FS.symlink instead');
      },
      joinPath() {
        abort('FS.joinPath has been removed; use PATH.join instead');
      },
      mmapAlloc() {
        abort(
          'FS.mmapAlloc has been replaced by the top level function mmapAlloc'
        );
      },
      standardizePath() {
        abort(
          'FS.standardizePath has been removed; use PATH.normalize instead'
        );
      },
    };
    var SYSCALLS = {
      DEFAULT_POLLMASK: 5,
      calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);
          }
          return dir;
        }
        return dir + '/' + path;
      },
      writeStat(buf, stat) {
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[(buf + 4) >> 2] = stat.mode;
        HEAPU32[(buf + 8) >> 2] = stat.nlink;
        HEAP32[(buf + 12) >> 2] = stat.uid;
        HEAP32[(buf + 16) >> 2] = stat.gid;
        HEAP32[(buf + 20) >> 2] = stat.rdev;
        HEAP64[(buf + 24) >> 3] = BigInt(stat.size);
        HEAP32[(buf + 32) >> 2] = 4096;
        HEAP32[(buf + 36) >> 2] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        HEAP64[(buf + 40) >> 3] = BigInt(Math.floor(atime / 1e3));
        HEAPU32[(buf + 48) >> 2] = (atime % 1e3) * 1e3 * 1e3;
        HEAP64[(buf + 56) >> 3] = BigInt(Math.floor(mtime / 1e3));
        HEAPU32[(buf + 64) >> 2] = (mtime % 1e3) * 1e3 * 1e3;
        HEAP64[(buf + 72) >> 3] = BigInt(Math.floor(ctime / 1e3));
        HEAPU32[(buf + 80) >> 2] = (ctime % 1e3) * 1e3 * 1e3;
        HEAP64[(buf + 88) >> 3] = BigInt(stat.ino);
        return 0;
      },
      writeStatFs(buf, stats) {
        HEAP32[(buf + 4) >> 2] = stats.bsize;
        HEAP32[(buf + 40) >> 2] = stats.bsize;
        HEAP32[(buf + 8) >> 2] = stats.blocks;
        HEAP32[(buf + 12) >> 2] = stats.bfree;
        HEAP32[(buf + 16) >> 2] = stats.bavail;
        HEAP32[(buf + 20) >> 2] = stats.files;
        HEAP32[(buf + 24) >> 2] = stats.ffree;
        HEAP32[(buf + 28) >> 2] = stats.fsid;
        HEAP32[(buf + 44) >> 2] = stats.flags;
        HEAP32[(buf + 36) >> 2] = stats.namelen;
      },
      doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
      getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
      varargs: undefined,
      getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
    };
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
        return e.errno;
      }
    }
    var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
        return e.errno;
      }
    }
    var INT53_MAX = 9007199254740992;
    var INT53_MIN = -9007199254740992;
    var bigintToI53Checked = (num) =>
      num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
    function _fd_seek(fd, offset, whence, newOffset) {
      offset = bigintToI53Checked(offset);
      try {
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        HEAP64[newOffset >> 3] = BigInt(stream.position);
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
        return e.errno;
      }
    }
    var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[(iov + 4) >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          break;
        }
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
        return e.errno;
      }
    }
    var emnapiExternalMemory = {
      registry: {},
      table: new WeakMap(),
      wasmMemoryViewTable: new WeakMap(),
      init: function () {
        emnapiExternalMemory.registry =
          typeof FinalizationRegistry === 'function'
            ? new FinalizationRegistry(function (_pointer) {
                _free(_pointer);
              })
            : undefined;
        emnapiExternalMemory.table = new WeakMap();
        emnapiExternalMemory.wasmMemoryViewTable = new WeakMap();
      },
      isDetachedArrayBuffer: function (arrayBuffer) {
        if (arrayBuffer.byteLength === 0) {
          try {
            new Uint8Array(arrayBuffer);
          } catch (_) {
            return true;
          }
        }
        return false;
      },
      getArrayBufferPointer: function (arrayBuffer, shouldCopy) {
        var _a;
        var info = { address: 0, ownership: 0, runtimeAllocated: 0 };
        if (arrayBuffer === wasmMemory.buffer) {
          return info;
        }
        var isDetached =
          emnapiExternalMemory.isDetachedArrayBuffer(arrayBuffer);
        if (emnapiExternalMemory.table.has(arrayBuffer)) {
          var cachedInfo = emnapiExternalMemory.table.get(arrayBuffer);
          if (isDetached) {
            cachedInfo.address = 0;
            return cachedInfo;
          }
          if (
            shouldCopy &&
            cachedInfo.ownership === 0 &&
            cachedInfo.runtimeAllocated === 1
          ) {
            new Uint8Array(wasmMemory.buffer).set(
              new Uint8Array(arrayBuffer),
              cachedInfo.address
            );
          }
          return cachedInfo;
        }
        if (isDetached || arrayBuffer.byteLength === 0) {
          return info;
        }
        if (!shouldCopy) {
          return info;
        }
        var pointer = _malloc(arrayBuffer.byteLength);
        if (!pointer) throw new Error('Out of memory');
        new Uint8Array(wasmMemory.buffer).set(
          new Uint8Array(arrayBuffer),
          pointer
        );
        info.address = pointer;
        info.ownership = emnapiExternalMemory.registry ? 0 : 1;
        info.runtimeAllocated = 1;
        emnapiExternalMemory.table.set(arrayBuffer, info);
        (_a = emnapiExternalMemory.registry) === null || _a === void 0
          ? void 0
          : _a.register(arrayBuffer, pointer);
        return info;
      },
      getOrUpdateMemoryView: function (view) {
        if (view.buffer === wasmMemory.buffer) {
          if (!emnapiExternalMemory.wasmMemoryViewTable.has(view)) {
            emnapiExternalMemory.wasmMemoryViewTable.set(view, {
              Ctor: view.constructor,
              address: view.byteOffset,
              length: view instanceof DataView ? view.byteLength : view.length,
              ownership: 1,
              runtimeAllocated: 0,
            });
          }
          return view;
        }
        var maybeOldWasmMemory =
          emnapiExternalMemory.isDetachedArrayBuffer(view.buffer) ||
          (typeof SharedArrayBuffer === 'function' &&
            view.buffer instanceof SharedArrayBuffer);
        if (
          maybeOldWasmMemory &&
          emnapiExternalMemory.wasmMemoryViewTable.has(view)
        ) {
          var info = emnapiExternalMemory.wasmMemoryViewTable.get(view);
          var Ctor = info.Ctor;
          var newView = void 0;
          var Buffer = emnapiCtx.feature.Buffer;
          if (typeof Buffer === 'function' && Ctor === Buffer) {
            newView = Buffer.from(wasmMemory.buffer, info.address, info.length);
          } else {
            newView = new Ctor(wasmMemory.buffer, info.address, info.length);
          }
          emnapiExternalMemory.wasmMemoryViewTable.set(newView, info);
          return newView;
        }
        return view;
      },
      getViewPointer: function (view, shouldCopy) {
        view = emnapiExternalMemory.getOrUpdateMemoryView(view);
        if (view.buffer === wasmMemory.buffer) {
          if (emnapiExternalMemory.wasmMemoryViewTable.has(view)) {
            var _a = emnapiExternalMemory.wasmMemoryViewTable.get(view),
              address_1 = _a.address,
              ownership_1 = _a.ownership,
              runtimeAllocated_1 = _a.runtimeAllocated;
            return {
              address: address_1,
              ownership: ownership_1,
              runtimeAllocated: runtimeAllocated_1,
              view,
            };
          }
          return {
            address: view.byteOffset,
            ownership: 1,
            runtimeAllocated: 0,
            view,
          };
        }
        var _b = emnapiExternalMemory.getArrayBufferPointer(
            view.buffer,
            shouldCopy
          ),
          address = _b.address,
          ownership = _b.ownership,
          runtimeAllocated = _b.runtimeAllocated;
        return {
          address: address === 0 ? 0 : address + view.byteOffset,
          ownership,
          runtimeAllocated,
          view,
        };
      },
    };
    function emnapiGetHandle(js_object) {
      var handle = emnapiCtx.handleStore.get(js_object);
      if (!(handle.isObject() || handle.isFunction())) {
        return { status: 1 };
      }
      if (
        typeof emnapiExternalMemory !== 'undefined' &&
        ArrayBuffer.isView(handle.value)
      ) {
        if (emnapiExternalMemory.wasmMemoryViewTable.has(handle.value)) {
          handle = emnapiCtx.addToCurrentScope(
            emnapiExternalMemory.wasmMemoryViewTable.get(handle.value)
          );
        }
      }
      return { status: 0, handle };
    }
    function _napi_add_finalizer(
      env,
      js_object,
      finalize_data,
      finalize_cb,
      finalize_hint,
      result
    ) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!emnapiCtx.feature.supportFinalizer) {
        return envObject.setLastError(9);
      }
      if (!js_object) return envObject.setLastError(1);
      if (!finalize_cb) return envObject.setLastError(1);
      var handleResult = emnapiGetHandle(js_object);
      if (handleResult.status !== 0) {
        return envObject.setLastError(handleResult.status);
      }
      var handle = handleResult.handle;
      var ownership = !result ? 0 : 1;
      var reference = emnapiCtx.createReferenceWithFinalizer(
        envObject,
        handle.id,
        0,
        ownership,
        finalize_cb,
        finalize_data,
        finalize_hint
      );
      if (result) {
        var referenceId = reference.id;
        HEAPU32[result >> 2] = referenceId;
      }
      return envObject.clearLastError();
    }
    function _napi_clear_last_error(env) {
      var envObject = emnapiCtx.envStore.get(env);
      return envObject.clearLastError();
    }
    function _napi_close_escapable_handle_scope(env, scope) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!scope) return envObject.setLastError(1);
      if (envObject.openHandleScopes === 0) {
        return 13;
      }
      emnapiCtx.closeScope(envObject);
      return envObject.clearLastError();
    }
    function _napi_close_handle_scope(env, scope) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!scope) return envObject.setLastError(1);
      if (envObject.openHandleScopes === 0) {
        return 13;
      }
      emnapiCtx.closeScope(envObject);
      return envObject.clearLastError();
    }
    function _napi_create_error(env, code, msg, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!msg) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var msgValue = emnapiCtx.handleStore.get(msg).value;
      if (typeof msgValue !== 'string') {
        return envObject.setLastError(3);
      }
      var error = new Error(msgValue);
      if (code) {
        var codeValue = emnapiCtx.handleStore.get(code).value;
        if (typeof codeValue !== 'string') {
          return envObject.setLastError(3);
        }
        error.code = codeValue;
      }
      var value = emnapiCtx.addToCurrentScope(error).id;
      HEAPU32[result >> 2] = value;
      return envObject.clearLastError();
    }
    function _napi_create_external(
      env,
      data,
      finalize_cb,
      finalize_hint,
      result
    ) {
      var value;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!result) return envObject.setLastError(1);
        if (!emnapiCtx.feature.supportFinalizer && finalize_cb) {
          throw emnapiCtx.createNotSupportWeakRefError(
            'napi_create_external',
            'Parameter "finalize_cb" must be 0(NULL)'
          );
        }
        var externalHandle = emnapiCtx.getCurrentScope().addExternal(data);
        if (finalize_cb) {
          emnapiCtx.createReferenceWithFinalizer(
            envObject,
            externalHandle.id,
            0,
            0,
            finalize_cb,
            data,
            finalize_hint
          );
        }
        value = externalHandle.id;
        HEAPU32[result >> 2] = value;
        return envObject.clearLastError();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    var emnapiString = {
      utf8Decoder: undefined,
      utf16Decoder: undefined,
      init: function () {
        var fallbackDecoder = {
          decode: function (bytes) {
            var inputIndex = 0;
            var pendingSize = Math.min(4096, bytes.length + 1);
            var pending = new Uint16Array(pendingSize);
            var chunks = [];
            var pendingIndex = 0;
            for (;;) {
              var more = inputIndex < bytes.length;
              if (!more || pendingIndex >= pendingSize - 1) {
                var subarray = pending.subarray(0, pendingIndex);
                var arraylike = subarray;
                chunks.push(String.fromCharCode.apply(null, arraylike));
                if (!more) {
                  return chunks.join('');
                }
                bytes = bytes.subarray(inputIndex);
                inputIndex = 0;
                pendingIndex = 0;
              }
              var byte1 = bytes[inputIndex++];
              if ((byte1 & 128) === 0) {
                pending[pendingIndex++] = byte1;
              } else if ((byte1 & 224) === 192) {
                var byte2 = bytes[inputIndex++] & 63;
                pending[pendingIndex++] = ((byte1 & 31) << 6) | byte2;
              } else if ((byte1 & 240) === 224) {
                var byte2 = bytes[inputIndex++] & 63;
                var byte3 = bytes[inputIndex++] & 63;
                pending[pendingIndex++] =
                  ((byte1 & 31) << 12) | (byte2 << 6) | byte3;
              } else if ((byte1 & 248) === 240) {
                var byte2 = bytes[inputIndex++] & 63;
                var byte3 = bytes[inputIndex++] & 63;
                var byte4 = bytes[inputIndex++] & 63;
                var codepoint =
                  ((byte1 & 7) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;
                if (codepoint > 65535) {
                  codepoint -= 65536;
                  pending[pendingIndex++] = ((codepoint >>> 10) & 1023) | 55296;
                  codepoint = 56320 | (codepoint & 1023);
                }
                pending[pendingIndex++] = codepoint;
              } else {
              }
            }
          },
        };
        var utf8Decoder;
        utf8Decoder =
          typeof TextDecoder === 'function'
            ? new TextDecoder()
            : fallbackDecoder;
        emnapiString.utf8Decoder = utf8Decoder;
        var fallbackDecoder2 = {
          decode: function (input) {
            var bytes = new Uint16Array(
              input.buffer,
              input.byteOffset,
              input.byteLength / 2
            );
            if (bytes.length <= 4096) {
              return String.fromCharCode.apply(null, bytes);
            }
            var chunks = [];
            var i = 0;
            var len = 0;
            for (; i < bytes.length; i += len) {
              len = Math.min(4096, bytes.length - i);
              chunks.push(
                String.fromCharCode.apply(null, bytes.subarray(i, i + len))
              );
            }
            return chunks.join('');
          },
        };
        var utf16Decoder;
        utf16Decoder =
          typeof TextDecoder === 'function'
            ? new TextDecoder('utf-16le')
            : fallbackDecoder2;
        emnapiString.utf16Decoder = utf16Decoder;
      },
      lengthBytesUTF8: function (str) {
        var c;
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          c = str.charCodeAt(i);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i;
          } else {
            len += 3;
          }
        }
        return len;
      },
      UTF8ToString: function (ptr, length) {
        if (!ptr || !length) return '';
        ptr >>>= 0;
        var HEAPU8 = new Uint8Array(wasmMemory.buffer);
        var end = ptr;
        if (length === -1) {
          for (; HEAPU8[end]; ) ++end;
        } else {
          end = ptr + (length >>> 0);
        }
        length = end - ptr;
        if (length <= 16) {
          var idx = ptr;
          var str = '';
          while (idx < end) {
            var u0 = HEAPU8[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = HEAPU8[idx++] & 63;
            if ((u0 & 224) === 192) {
              str += String.fromCharCode(((u0 & 31) << 6) | u1);
              continue;
            }
            var u2 = HEAPU8[idx++] & 63;
            if ((u0 & 240) === 224) {
              u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
              u0 =
                ((u0 & 7) << 18) |
                (u1 << 12) |
                (u2 << 6) |
                (HEAPU8[idx++] & 63);
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(
                55296 | (ch >> 10),
                56320 | (ch & 1023)
              );
            }
          }
          return str;
        }
        return emnapiString.utf8Decoder.decode(HEAPU8.subarray(ptr, end));
      },
      stringToUTF8: function (str, outPtr, maxBytesToWrite) {
        var HEAPU8 = new Uint8Array(wasmMemory.buffer);
        var outIdx = outPtr;
        outIdx >>>= 0;
        if (!(maxBytesToWrite > 0)) {
          return 0;
        }
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i = 0; i < str.length; ++i) {
          var u = str.charCodeAt(i);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            HEAPU8[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            HEAPU8[outIdx++] = 192 | (u >> 6);
            HEAPU8[outIdx++] = 128 | (u & 63);
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            HEAPU8[outIdx++] = 224 | (u >> 12);
            HEAPU8[outIdx++] = 128 | ((u >> 6) & 63);
            HEAPU8[outIdx++] = 128 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break;
            HEAPU8[outIdx++] = 240 | (u >> 18);
            HEAPU8[outIdx++] = 128 | ((u >> 12) & 63);
            HEAPU8[outIdx++] = 128 | ((u >> 6) & 63);
            HEAPU8[outIdx++] = 128 | (u & 63);
          }
        }
        HEAPU8[outIdx] = 0;
        return outIdx - startIdx;
      },
      UTF16ToString: function (ptr, length) {
        if (!ptr || !length) return '';
        ptr >>>= 0;
        var end = ptr;
        if (length === -1) {
          var idx = end >> 1;
          var HEAPU16 = new Uint16Array(wasmMemory.buffer);
          while (HEAPU16[idx]) ++idx;
          end = idx << 1;
        } else {
          end = ptr + (length >>> 0) * 2;
        }
        length = end - ptr;
        if (length <= 32) {
          return String.fromCharCode.apply(
            null,
            new Uint16Array(wasmMemory.buffer, ptr, length / 2)
          );
        }
        var HEAPU8 = new Uint8Array(wasmMemory.buffer);
        return emnapiString.utf16Decoder.decode(HEAPU8.subarray(ptr, end));
      },
      stringToUTF16: function (str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
          maxBytesToWrite = 2147483647;
        }
        if (maxBytesToWrite < 2) return 0;
        maxBytesToWrite -= 2;
        var startPtr = outPtr;
        var numCharsToWrite =
          maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          var codeUnit = str.charCodeAt(i);
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr;
      },
      newString: function (env, str, length, result, stringMaker) {
        if (!env) return 1;
        var envObject = emnapiCtx.envStore.get(env);
        envObject.checkGCAccess();
        var autoLength = length === -1;
        var sizelength = length >>> 0;
        if (length !== 0) {
          if (!str) return envObject.setLastError(1);
        }
        if (!result) return envObject.setLastError(1);
        if (!(autoLength || sizelength <= 2147483647))
          return envObject.setLastError(1);
        var strValue = stringMaker(str, autoLength, sizelength);
        var value = emnapiCtx.addToCurrentScope(strValue).id;
        HEAPU32[result >> 2] = value;
        return envObject.clearLastError();
      },
      newExternalString: function (
        env,
        str,
        length,
        finalize_callback,
        finalize_hint,
        result,
        copied,
        createApi,
        stringMaker
      ) {
        if (!env) return 1;
        var envObject = emnapiCtx.envStore.get(env);
        envObject.checkGCAccess();
        var autoLength = length === -1;
        var sizelength = length >>> 0;
        if (length !== 0) {
          if (!str) return envObject.setLastError(1);
        }
        if (!result) return envObject.setLastError(1);
        if (!(autoLength || sizelength <= 2147483647))
          return envObject.setLastError(1);
        var status = createApi(env, str, length, result);
        if (status === 0) {
          if (copied) {
            HEAP8[copied] = 1;
          }
          if (finalize_callback) {
            envObject.callFinalizer(finalize_callback, str, finalize_hint);
          }
        }
        return status;
      },
    };
    function emnapiCreateFunction(envObject, utf8name, length, cb, data) {
      var functionName =
        !utf8name || !length ? '' : emnapiString.UTF8ToString(utf8name, length);
      var f;
      var napiCallback = getWasmTableEntry(cb);
      var callback = function (envObject) {
        return napiCallback(
          envObject.id,
          envObject.ctx.scopeStore.currentScope.id
        );
      };
      var makeFunction = function (envObject, callback) {
        return function () {
          'use strict';
          var scope = envObject.ctx.openScope(envObject);
          var callbackInfo = scope.callbackInfo;
          callbackInfo.data = data;
          callbackInfo.args = arguments;
          callbackInfo.thiz = this;
          callbackInfo.fn = f;
          try {
            var napiValue = envObject.callIntoModule(callback);
            return !napiValue
              ? undefined
              : envObject.ctx.handleStore.get(napiValue).value;
          } finally {
            callbackInfo.data = 0;
            callbackInfo.args = undefined;
            callbackInfo.thiz = undefined;
            callbackInfo.fn = undefined;
            envObject.ctx.closeScope(envObject, scope);
          }
        };
      };
      if (functionName === '') {
        f = makeFunction(envObject, callback);
        return { status: 0, f };
      }
      if (!/^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(functionName)) {
        return { status: 1, f: undefined };
      }
      if (emnapiCtx.feature.supportNewFunction) {
        var _ = makeFunction(envObject, callback);
        try {
          f = new Function(
            '_',
            'return function ' +
              functionName +
              '(){' +
              '"use strict";' +
              'return _.apply(this,arguments);' +
              '};'
          )(_);
        } catch (_err) {
          f = makeFunction(envObject, callback);
          if (emnapiCtx.feature.canSetFunctionName)
            Object.defineProperty(f, 'name', { value: functionName });
        }
      } else {
        f = makeFunction(envObject, callback);
        if (emnapiCtx.feature.canSetFunctionName)
          Object.defineProperty(f, 'name', { value: functionName });
      }
      return { status: 0, f };
    }
    function _napi_create_function(env, utf8name, length, cb, data, result) {
      var value;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!result) return envObject.setLastError(1);
        if (!cb) return envObject.setLastError(1);
        var fresult = emnapiCreateFunction(
          envObject,
          utf8name,
          length,
          cb,
          data
        );
        if (fresult.status !== 0) return envObject.setLastError(fresult.status);
        var f = fresult.f;
        var valueHandle = emnapiCtx.addToCurrentScope(f);
        value = valueHandle.id;
        HEAPU32[result >> 2] = value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_create_object(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      var value = emnapiCtx.addToCurrentScope({}).id;
      HEAPU32[result >> 2] = value;
      return envObject.clearLastError();
    }
    function _napi_create_reference(env, value, initial_refcount, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var handle = emnapiCtx.handleStore.get(value);
      if (envObject.moduleApiVersion < 10) {
        if (!(handle.isObject() || handle.isFunction() || handle.isSymbol())) {
          return envObject.setLastError(1);
        }
      }
      var ref = emnapiCtx.createReference(
        envObject,
        handle.id,
        initial_refcount >>> 0,
        1
      );
      HEAPU32[result >> 2] = ref.id;
      return envObject.clearLastError();
    }
    function _napi_create_string_utf8(env, str, length, result) {
      return emnapiString.newString(env, str, length, result, function (str) {
        return emnapiString.UTF8ToString(str, length);
      });
    }
    function _napi_create_type_error(env, code, msg, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!msg) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var msgValue = emnapiCtx.handleStore.get(msg).value;
      if (typeof msgValue !== 'string') {
        return envObject.setLastError(3);
      }
      var error = new TypeError(msgValue);
      if (code) {
        var codeValue = emnapiCtx.handleStore.get(code).value;
        if (typeof codeValue !== 'string') {
          return envObject.setLastError(3);
        }
        error.code = codeValue;
      }
      var value = emnapiCtx.addToCurrentScope(error).id;
      HEAPU32[result >> 2] = value;
      return envObject.clearLastError();
    }
    function emnapiDefineProperty(
      envObject,
      obj,
      propertyName,
      method,
      getter,
      setter,
      value,
      attributes,
      data
    ) {
      if (getter || setter) {
        var localGetter = void 0;
        var localSetter = void 0;
        if (getter) {
          localGetter = emnapiCreateFunction(envObject, 0, 0, getter, data).f;
        }
        if (setter) {
          localSetter = emnapiCreateFunction(envObject, 0, 0, setter, data).f;
        }
        var desc = {
          configurable: (attributes & 4) !== 0,
          enumerable: (attributes & 2) !== 0,
          get: localGetter,
          set: localSetter,
        };
        Object.defineProperty(obj, propertyName, desc);
      } else if (method) {
        var localMethod = emnapiCreateFunction(envObject, 0, 0, method, data).f;
        var desc = {
          configurable: (attributes & 4) !== 0,
          enumerable: (attributes & 2) !== 0,
          writable: (attributes & 1) !== 0,
          value: localMethod,
        };
        Object.defineProperty(obj, propertyName, desc);
      } else {
        var desc = {
          configurable: (attributes & 4) !== 0,
          enumerable: (attributes & 2) !== 0,
          writable: (attributes & 1) !== 0,
          value: emnapiCtx.handleStore.get(value).value,
        };
        Object.defineProperty(obj, propertyName, desc);
      }
    }
    function _napi_define_class(
      env,
      utf8name,
      length,
      constructor,
      callback_data,
      property_count,
      properties,
      result
    ) {
      var propPtr, valueHandleId, attributes;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!result) return envObject.setLastError(1);
        if (!constructor) return envObject.setLastError(1);
        property_count = property_count >>> 0;
        if (property_count > 0) {
          if (!properties) return envObject.setLastError(1);
        }
        if (length < -1 || length > 2147483647 || !utf8name) {
          return envObject.setLastError(1);
        }
        var fresult = emnapiCreateFunction(
          envObject,
          utf8name,
          length,
          constructor,
          callback_data
        );
        if (fresult.status !== 0) return envObject.setLastError(fresult.status);
        var F = fresult.f;
        var propertyName = void 0;
        for (var i = 0; i < property_count; i++) {
          propPtr = properties + i * (4 * 8);
          var utf8Name = HEAPU32[propPtr >> 2];
          var name_1 = HEAPU32[(propPtr + 4) >> 2];
          var method = HEAPU32[(propPtr + 8) >> 2];
          var getter = HEAPU32[(propPtr + 12) >> 2];
          var setter = HEAPU32[(propPtr + 16) >> 2];
          var value = HEAPU32[(propPtr + 20) >> 2];
          attributes = HEAP32[(propPtr + 24) >> 2];
          var data = HEAPU32[(propPtr + 28) >> 2];
          if (utf8Name) {
            propertyName = emnapiString.UTF8ToString(utf8Name, -1);
          } else {
            if (!name_1) {
              return envObject.setLastError(4);
            }
            propertyName = emnapiCtx.handleStore.get(name_1).value;
            if (
              typeof propertyName !== 'string' &&
              typeof propertyName !== 'symbol'
            ) {
              return envObject.setLastError(4);
            }
          }
          if ((attributes & 1024) !== 0) {
            emnapiDefineProperty(
              envObject,
              F,
              propertyName,
              method,
              getter,
              setter,
              value,
              attributes,
              data
            );
            continue;
          }
          emnapiDefineProperty(
            envObject,
            F.prototype,
            propertyName,
            method,
            getter,
            setter,
            value,
            attributes,
            data
          );
        }
        var valueHandle = emnapiCtx.addToCurrentScope(F);
        valueHandleId = valueHandle.id;
        HEAPU32[result >> 2] = valueHandleId;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_define_properties(env, object, property_count, properties) {
      var propPtr, attributes;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        property_count = property_count >>> 0;
        if (property_count > 0) {
          if (!properties) return envObject.setLastError(1);
        }
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        var maybeObject = h.value;
        if (!(h.isObject() || h.isFunction())) {
          return envObject.setLastError(2);
        }
        var propertyName = void 0;
        for (var i = 0; i < property_count; i++) {
          propPtr = properties + i * (4 * 8);
          var utf8Name = HEAPU32[propPtr >> 2];
          var name_2 = HEAPU32[(propPtr + 4) >> 2];
          var method = HEAPU32[(propPtr + 8) >> 2];
          var getter = HEAPU32[(propPtr + 12) >> 2];
          var setter = HEAPU32[(propPtr + 16) >> 2];
          var value = HEAPU32[(propPtr + 20) >> 2];
          attributes = HEAP32[(propPtr + 24) >> 2];
          var data = HEAPU32[(propPtr + 28) >> 2];
          if (utf8Name) {
            propertyName = emnapiString.UTF8ToString(utf8Name, -1);
          } else {
            if (!name_2) {
              return envObject.setLastError(4);
            }
            propertyName = emnapiCtx.handleStore.get(name_2).value;
            if (
              typeof propertyName !== 'string' &&
              typeof propertyName !== 'symbol'
            ) {
              return envObject.setLastError(4);
            }
          }
          emnapiDefineProperty(
            envObject,
            maybeObject,
            propertyName,
            method,
            getter,
            setter,
            value,
            attributes,
            data
          );
        }
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_delete_reference(env, ref) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      if (!ref) return envObject.setLastError(1);
      emnapiCtx.refStore.get(ref).dispose();
      return envObject.clearLastError();
    }
    function _napi_escape_handle(env, scope, escapee, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!scope) return envObject.setLastError(1);
      if (!escapee) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var scopeObject = emnapiCtx.scopeStore.get(scope);
      if (!scopeObject.escapeCalled()) {
        var newHandle = scopeObject.escape(escapee);
        var value = newHandle ? newHandle.id : 0;
        HEAPU32[result >> 2] = value;
        return envObject.clearLastError();
      }
      return envObject.setLastError(12);
    }
    var emnapiNodeBinding = undefined;
    function _napi_fatal_error(location, location_len, message, message_len) {
      var locationStr = emnapiString.UTF8ToString(location, location_len);
      var messageStr = emnapiString.UTF8ToString(message, message_len);
      if (emnapiNodeBinding) {
        emnapiNodeBinding.napi.fatalError(locationStr, messageStr);
      } else {
        abort('FATAL ERROR: ' + locationStr + ' ' + messageStr);
      }
    }
    function _napi_get_and_clear_last_exception(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      if (!envObject.tryCatch.hasCaught()) {
        HEAPU32[result >> 2] = 1;
        return envObject.clearLastError();
      } else {
        var err = envObject.tryCatch.exception();
        var value = envObject.ensureHandleId(err);
        HEAPU32[result >> 2] = value;
        envObject.tryCatch.reset();
      }
      return envObject.clearLastError();
    }
    function _napi_get_array_length(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!value) return envObject.setLastError(1);
        if (!result) return envObject.setLastError(1);
        var handle = emnapiCtx.handleStore.get(value);
        if (!handle.isArray()) {
          return envObject.setLastError(8);
        }
        var v = handle.value.length >>> 0;
        HEAPU32[result >> 2] = v;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_get_cb_info(env, cbinfo, argc, argv, this_arg, data) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      if (!cbinfo) return envObject.setLastError(1);
      var cbinfoValue = emnapiCtx.scopeStore.get(cbinfo).callbackInfo;
      if (argv) {
        if (!argc) return envObject.setLastError(1);
        var argcValue = HEAPU32[argc >> 2];
        var len = cbinfoValue.args.length;
        var arrlen = argcValue < len ? argcValue : len;
        var i = 0;
        for (; i < arrlen; i++) {
          var argVal = envObject.ensureHandleId(cbinfoValue.args[i]);
          HEAPU32[(argv + i * 4) >> 2] = argVal;
        }
        if (i < argcValue) {
          for (; i < argcValue; i++) {
            HEAPU32[(argv + i * 4) >> 2] = 1;
          }
        }
      }
      if (argc) {
        HEAPU32[argc >> 2] = cbinfoValue.args.length;
      }
      if (this_arg) {
        var v = envObject.ensureHandleId(cbinfoValue.thiz);
        HEAPU32[this_arg >> 2] = v;
      }
      if (data) {
        HEAPU32[data >> 2] = cbinfoValue.data;
      }
      return envObject.clearLastError();
    }
    function _napi_get_element(env, object, index, result) {
      var value;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!result) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (h.value == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var v = void 0;
        try {
          v = h.isObject() || h.isFunction() ? h.value : Object(h.value);
        } catch (_) {
          return envObject.setLastError(2);
        }
        value = envObject.ensureHandleId(v[index >>> 0]);
        HEAPU32[result >> 2] = value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_get_named_property(env, object, utf8name, result) {
      var value;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!result) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        if (!utf8name) {
          return envObject.setLastError(1);
        }
        var h = emnapiCtx.handleStore.get(object);
        if (h.value == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var v = void 0;
        try {
          v = h.isObject() || h.isFunction() ? h.value : Object(h.value);
        } catch (_) {
          return envObject.setLastError(2);
        }
        value = envObject.ensureHandleId(
          v[emnapiString.UTF8ToString(utf8name, -1)]
        );
        HEAPU32[result >> 2] = value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_get_new_target(env, cbinfo, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!cbinfo) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var cbinfoValue = emnapiCtx.scopeStore.get(cbinfo).callbackInfo;
      var thiz = cbinfoValue.thiz,
        fn = cbinfoValue.fn;
      var value =
        thiz == null || thiz.constructor == null
          ? 0
          : thiz instanceof fn
          ? envObject.ensureHandleId(thiz.constructor)
          : 0;
      HEAPU32[result >> 2] = value;
      return envObject.clearLastError();
    }
    function _napi_get_property(env, object, key, result) {
      var value;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!key) return envObject.setLastError(1);
        if (!result) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (h.value == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var v = void 0;
        try {
          v = h.isObject() || h.isFunction() ? h.value : Object(h.value);
        } catch (_) {
          return envObject.setLastError(2);
        }
        value = envObject.ensureHandleId(
          v[emnapiCtx.handleStore.get(key).value]
        );
        HEAPU32[result >> 2] = value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_get_reference_value(env, ref, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!ref) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var reference = emnapiCtx.refStore.get(ref);
      var handleId = reference.get(envObject);
      HEAPU32[result >> 2] = handleId;
      return envObject.clearLastError();
    }
    function _napi_get_undefined(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      var value = 1;
      HEAPU32[result >> 2] = value;
      return envObject.clearLastError();
    }
    function _napi_get_value_bool(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var handle = emnapiCtx.handleStore.get(value);
      if (typeof handle.value !== 'boolean') {
        return envObject.setLastError(7);
      }
      var r = handle.value ? 1 : 0;
      HEAP8[result] = r;
      return envObject.clearLastError();
    }
    function _napi_get_value_double(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var handle = emnapiCtx.handleStore.get(value);
      if (typeof handle.value !== 'number') {
        return envObject.setLastError(6);
      }
      var r = handle.value;
      HEAPF64[result >> 3] = r;
      return envObject.clearLastError();
    }
    function _napi_get_value_external(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var handle = emnapiCtx.handleStore.get(value);
      if (!handle.isExternal()) {
        return envObject.setLastError(1);
      }
      var p = handle.data();
      HEAPU32[result >> 2] = p;
      return envObject.clearLastError();
    }
    function _napi_get_value_string_utf8(env, value, buf, buf_size, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      buf_size = buf_size >>> 0;
      var handle = emnapiCtx.handleStore.get(value);
      if (typeof handle.value !== 'string') {
        return envObject.setLastError(3);
      }
      if (!buf) {
        if (!result) return envObject.setLastError(1);
        var strLength = emnapiString.lengthBytesUTF8(handle.value);
        HEAPU32[result >> 2] = strLength;
      } else if (buf_size !== 0) {
        var copied = emnapiString.stringToUTF8(handle.value, buf, buf_size);
        if (result) {
          HEAPU32[result >> 2] = copied;
        }
      } else if (result) {
        HEAPU32[result >> 2] = 0;
      }
      return envObject.clearLastError();
    }
    function _napi_has_property(env, object, key, result) {
      var r;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!key) return envObject.setLastError(1);
        if (!result) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (h.value == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var v = void 0;
        try {
          v = h.isObject() || h.isFunction() ? h.value : Object(h.value);
        } catch (_) {
          return envObject.setLastError(2);
        }
        r = emnapiCtx.handleStore.get(key).value in v ? 1 : 0;
        HEAP8[result] = r;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_is_array(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var h = emnapiCtx.handleStore.get(value);
      var r = h.isArray() ? 1 : 0;
      HEAP8[result] = r;
      return envObject.clearLastError();
    }
    function _napi_is_exception_pending(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      var r = envObject.tryCatch.hasCaught();
      HEAP8[result] = r ? 1 : 0;
      return envObject.clearLastError();
    }
    function _napi_new_instance(env, constructor, argc, argv, result) {
      var i;
      var v;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!constructor) return envObject.setLastError(1);
        argc = argc >>> 0;
        if (argc > 0) {
          if (!argv) return envObject.setLastError(1);
        }
        if (!result) return envObject.setLastError(1);
        var Ctor = emnapiCtx.handleStore.get(constructor).value;
        if (typeof Ctor !== 'function') return envObject.setLastError(1);
        var ret = void 0;
        if (emnapiCtx.feature.supportReflect) {
          var argList = Array(argc);
          for (i = 0; i < argc; i++) {
            var argVal = HEAPU32[(argv + i * 4) >> 2];
            argList[i] = emnapiCtx.handleStore.get(argVal).value;
          }
          ret = Reflect.construct(Ctor, argList, Ctor);
        } else {
          var args = Array(argc + 1);
          args[0] = undefined;
          for (i = 0; i < argc; i++) {
            var argVal = HEAPU32[(argv + i * 4) >> 2];
            args[i + 1] = emnapiCtx.handleStore.get(argVal).value;
          }
          var BoundCtor = Ctor.bind.apply(Ctor, args);
          ret = new BoundCtor();
        }
        if (result) {
          v = envObject.ensureHandleId(ret);
          HEAPU32[result >> 2] = v;
        }
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_open_escapable_handle_scope(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      var scope = emnapiCtx.openScope(envObject);
      HEAPU32[result >> 2] = scope.id;
      return envObject.clearLastError();
    }
    function _napi_open_handle_scope(env, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!result) return envObject.setLastError(1);
      var scope = emnapiCtx.openScope(envObject);
      HEAPU32[result >> 2] = scope.id;
      return envObject.clearLastError();
    }
    function emnapiUnwrap(env, js_object, result, action) {
      var data;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!js_object) return envObject.setLastError(1);
        if (action === 0) {
          if (!result) return envObject.setLastError(1);
        }
        var value = emnapiCtx.handleStore.get(js_object);
        if (!(value.isObject() || value.isFunction())) {
          return envObject.setLastError(1);
        }
        var binding = envObject.getObjectBinding(value.value);
        var referenceId = binding.wrapped;
        var ref = emnapiCtx.refStore.get(referenceId);
        if (!ref) return envObject.setLastError(1);
        if (result) {
          data = ref.data();
          HEAPU32[result >> 2] = data;
        }
        if (action === 1) {
          binding.wrapped = 0;
          if (ref.ownership() === 1) {
            ref.resetFinalizer();
          } else {
            ref.dispose();
          }
        }
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_remove_wrap(env, js_object, result) {
      return emnapiUnwrap(env, js_object, result, 1);
    }
    function _napi_set_element(env, object, index, value) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!value) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (!(h.isObject() || h.isFunction())) {
          return envObject.setLastError(2);
        }
        h.value[index >>> 0] = emnapiCtx.handleStore.get(value).value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_set_last_error(
      env,
      error_code,
      engine_error_code,
      engine_reserved
    ) {
      var envObject = emnapiCtx.envStore.get(env);
      return envObject.setLastError(
        error_code,
        engine_error_code,
        engine_reserved
      );
    }
    function _napi_set_named_property(env, object, cname, value) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!value) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (!(h.isObject() || h.isFunction())) {
          return envObject.setLastError(2);
        }
        if (!cname) {
          return envObject.setLastError(1);
        }
        emnapiCtx.handleStore.get(object).value[
          emnapiString.UTF8ToString(cname, -1)
        ] = emnapiCtx.handleStore.get(value).value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_set_property(env, object, key, value) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!key) return envObject.setLastError(1);
        if (!value) return envObject.setLastError(1);
        if (!object) return envObject.setLastError(1);
        var h = emnapiCtx.handleStore.get(object);
        if (!(h.isObject() || h.isFunction())) {
          return envObject.setLastError(2);
        }
        h.value[emnapiCtx.handleStore.get(key).value] =
          emnapiCtx.handleStore.get(value).value;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_strict_equals(env, lhs, rhs, result) {
      var r;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!lhs) return envObject.setLastError(1);
        if (!rhs) return envObject.setLastError(1);
        if (!result) return envObject.setLastError(1);
        var lv = emnapiCtx.handleStore.get(lhs).value;
        var rv = emnapiCtx.handleStore.get(rhs).value;
        r = lv === rv ? 1 : 0;
        HEAP8[result] = r;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_throw(env, error) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!error) return envObject.setLastError(1);
        envObject.tryCatch.setError(emnapiCtx.handleStore.get(error).value);
        return envObject.clearLastError();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_typeof(env, value, result) {
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!value) return envObject.setLastError(1);
      if (!result) return envObject.setLastError(1);
      var v = emnapiCtx.handleStore.get(value);
      var r;
      if (v.isNumber()) {
        r = 3;
      } else if (v.isBigInt()) {
        r = 9;
      } else if (v.isString()) {
        r = 4;
      } else if (v.isFunction()) {
        r = 7;
      } else if (v.isExternal()) {
        r = 8;
      } else if (v.isObject()) {
        r = 6;
      } else if (v.isBoolean()) {
        r = 2;
      } else if (v.isUndefined()) {
        r = 0;
      } else if (v.isSymbol()) {
        r = 5;
      } else if (v.isNull()) {
        r = 1;
      } else {
        return envObject.setLastError(1);
      }
      HEAP32[result >> 2] = r;
      return envObject.clearLastError();
    }
    function _napi_unwrap(env, js_object, result) {
      return emnapiUnwrap(env, js_object, result, 0);
    }
    function emnapiWrap(
      env,
      js_object,
      native_object,
      finalize_cb,
      finalize_hint,
      result
    ) {
      var referenceId;
      if (!env) return 1;
      var envObject = emnapiCtx.envStore.get(env);
      envObject.checkGCAccess();
      if (!envObject.tryCatch.isEmpty()) return envObject.setLastError(10);
      if (!envObject.canCallIntoJs())
        return envObject.setLastError(
          envObject.moduleApiVersion >= 10 ? 23 : 10
        );
      envObject.clearLastError();
      try {
        if (!emnapiCtx.feature.supportFinalizer) {
          if (finalize_cb) {
            throw emnapiCtx.createNotSupportWeakRefError(
              'napi_wrap',
              'Parameter "finalize_cb" must be 0(NULL)'
            );
          }
          if (result) {
            throw emnapiCtx.createNotSupportWeakRefError(
              'napi_wrap',
              'Parameter "result" must be 0(NULL)'
            );
          }
        }
        if (!js_object) return envObject.setLastError(1);
        var handleResult = emnapiGetHandle(js_object);
        if (handleResult.status !== 0) {
          return envObject.setLastError(handleResult.status);
        }
        var handle = handleResult.handle;
        if (envObject.getObjectBinding(handle.value).wrapped !== 0) {
          return envObject.setLastError(1);
        }
        var reference = void 0;
        if (result) {
          if (!finalize_cb) return envObject.setLastError(1);
          reference = emnapiCtx.createReferenceWithFinalizer(
            envObject,
            handle.id,
            0,
            1,
            finalize_cb,
            native_object,
            finalize_hint
          );
          referenceId = reference.id;
          HEAPU32[result >> 2] = referenceId;
        } else if (finalize_cb) {
          reference = emnapiCtx.createReferenceWithFinalizer(
            envObject,
            handle.id,
            0,
            0,
            finalize_cb,
            native_object,
            finalize_hint
          );
        } else {
          reference = emnapiCtx.createReferenceWithData(
            envObject,
            handle.id,
            0,
            0,
            native_object
          );
        }
        envObject.getObjectBinding(handle.value).wrapped = reference.id;
        return envObject.getReturnStatus();
      } catch (err) {
        envObject.tryCatch.setError(err);
        return envObject.setLastError(10);
      }
    }
    function _napi_wrap(
      env,
      js_object,
      native_object,
      finalize_cb,
      finalize_hint,
      result
    ) {
      return emnapiWrap(
        env,
        js_object,
        native_object,
        finalize_cb,
        finalize_hint,
        result
      );
    }
    var emnapiModule = { exports: {}, loaded: false, filename: '' };
    var emnapiAsyncWorkPoolSize = 0;
    function emnapiInit(options) {
      if (emnapiModule.loaded) return emnapiModule.exports;
      if (typeof options !== 'object' || options === null) {
        throw new TypeError('Invalid emnapi init option');
      }
      var context = options.context;
      if (typeof context !== 'object' || context === null) {
        throw new TypeError(
          "Invalid `options.context`. Use `import { getDefaultContext } from '@emnapi/runtime'`"
        );
      }
      emnapiCtx = context;
      var filename =
        typeof options.filename === 'string' ? options.filename : '';
      emnapiModule.filename = filename;
      if ('nodeBinding' in options) {
        var nodeBinding = options.nodeBinding;
        if (typeof nodeBinding !== 'object' || nodeBinding === null) {
          throw new TypeError(
            'Invalid `options.nodeBinding`. Use @emnapi/node-binding package'
          );
        }
        emnapiNodeBinding = nodeBinding;
      }
      if ('asyncWorkPoolSize' in options) {
        if (typeof options.asyncWorkPoolSize !== 'number') {
          throw new TypeError('options.asyncWorkPoolSize must be a integer');
        }
        emnapiAsyncWorkPoolSize = options.asyncWorkPoolSize >> 0;
        if (emnapiAsyncWorkPoolSize > 1024) {
          emnapiAsyncWorkPoolSize = 1024;
        } else if (emnapiAsyncWorkPoolSize < -1024) {
          emnapiAsyncWorkPoolSize = -1024;
        }
      }
      var moduleApiVersion = _node_api_module_get_api_version_v1();
      var envObject =
        emnapiModule.envObject ||
        (emnapiModule.envObject = emnapiCtx.createEnv(
          filename,
          moduleApiVersion,
          function (cb) {
            return getWasmTableEntry(cb);
          },
          function (cb) {
            return getWasmTableEntry(cb);
          },
          abort,
          emnapiNodeBinding
        ));
      var scope = emnapiCtx.openScope(envObject);
      try {
        envObject.callIntoModule(function (_envObject) {
          var exports = emnapiModule.exports;
          var exportsHandle = scope.add(exports);
          var napiValue = _napi_register_wasm_v1(
            _envObject.id,
            exportsHandle.id
          );
          emnapiModule.exports = !napiValue
            ? exports
            : emnapiCtx.handleStore.get(napiValue).value;
        });
      } catch (err) {
        emnapiCtx.closeScope(envObject, scope);
        throw err;
      }
      emnapiCtx.closeScope(envObject, scope);
      emnapiModule.loaded = true;
      delete emnapiModule.envObject;
      return emnapiModule.exports;
    }
    var incrementExceptionRefcount = (ex) => {
      var ptr = getCppExceptionThrownObjectFromWebAssemblyException(ex);
      ___cxa_increment_exception_refcount(ptr);
    };
    Module['incrementExceptionRefcount'] = incrementExceptionRefcount;
    var decrementExceptionRefcount = (ex) => {
      var ptr = getCppExceptionThrownObjectFromWebAssemblyException(ex);
      ___cxa_decrement_exception_refcount(ptr);
    };
    Module['decrementExceptionRefcount'] = decrementExceptionRefcount;
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    emnapiExternalMemory.init();
    emnapiString.init();
    function checkIncomingModuleAPI() {
      ignoredModuleProp('fetchSettings');
    }
    var wasmImports = {
      __assert_fail: ___assert_fail,
      __call_sighandler: ___call_sighandler,
      __throw_exception_with_stack_trace: ___throw_exception_with_stack_trace,
      _abort_js: __abort_js,
      _emnapi_get_last_error_info: __emnapi_get_last_error_info,
      _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear,
      _tzset_js: __tzset_js,
      emscripten_date_now: _emscripten_date_now,
      emscripten_resize_heap: _emscripten_resize_heap,
      environ_get: _environ_get,
      environ_sizes_get: _environ_sizes_get,
      exit: _exit,
      fd_close: _fd_close,
      fd_read: _fd_read,
      fd_seek: _fd_seek,
      fd_write: _fd_write,
      napi_add_finalizer: _napi_add_finalizer,
      napi_clear_last_error: _napi_clear_last_error,
      napi_close_escapable_handle_scope: _napi_close_escapable_handle_scope,
      napi_close_handle_scope: _napi_close_handle_scope,
      napi_create_error: _napi_create_error,
      napi_create_external: _napi_create_external,
      napi_create_function: _napi_create_function,
      napi_create_object: _napi_create_object,
      napi_create_reference: _napi_create_reference,
      napi_create_string_utf8: _napi_create_string_utf8,
      napi_create_type_error: _napi_create_type_error,
      napi_define_class: _napi_define_class,
      napi_define_properties: _napi_define_properties,
      napi_delete_reference: _napi_delete_reference,
      napi_escape_handle: _napi_escape_handle,
      napi_fatal_error: _napi_fatal_error,
      napi_get_and_clear_last_exception: _napi_get_and_clear_last_exception,
      napi_get_array_length: _napi_get_array_length,
      napi_get_cb_info: _napi_get_cb_info,
      napi_get_element: _napi_get_element,
      napi_get_named_property: _napi_get_named_property,
      napi_get_new_target: _napi_get_new_target,
      napi_get_property: _napi_get_property,
      napi_get_reference_value: _napi_get_reference_value,
      napi_get_undefined: _napi_get_undefined,
      napi_get_value_bool: _napi_get_value_bool,
      napi_get_value_double: _napi_get_value_double,
      napi_get_value_external: _napi_get_value_external,
      napi_get_value_string_utf8: _napi_get_value_string_utf8,
      napi_has_property: _napi_has_property,
      napi_is_array: _napi_is_array,
      napi_is_exception_pending: _napi_is_exception_pending,
      napi_new_instance: _napi_new_instance,
      napi_open_escapable_handle_scope: _napi_open_escapable_handle_scope,
      napi_open_handle_scope: _napi_open_handle_scope,
      napi_remove_wrap: _napi_remove_wrap,
      napi_set_element: _napi_set_element,
      napi_set_last_error: _napi_set_last_error,
      napi_set_named_property: _napi_set_named_property,
      napi_set_property: _napi_set_property,
      napi_strict_equals: _napi_strict_equals,
      napi_throw: _napi_throw,
      napi_typeof: _napi_typeof,
      napi_unwrap: _napi_unwrap,
      napi_wrap: _napi_wrap,
      proc_exit: _proc_exit,
    };
    var wasmExports = await createWasm();
    var ___wasm_call_ctors = createExportWrapper('__wasm_call_ctors', 0);
    var _node_api_module_get_api_version_v1 = (Module[
      '_node_api_module_get_api_version_v1'
    ] = createExportWrapper('node_api_module_get_api_version_v1', 0));
    var _napi_register_wasm_v1 = (Module['_napi_register_wasm_v1'] =
      createExportWrapper('napi_register_wasm_v1', 2));
    var _malloc = (Module['_malloc'] = createExportWrapper('malloc', 1));
    var _free = (Module['_free'] = createExportWrapper('free', 1));
    var _fflush = createExportWrapper('fflush', 1);
    var _strerror = createExportWrapper('strerror', 1);
    var ___trap = wasmExports['__trap'];
    var _emscripten_stack_init = wasmExports['emscripten_stack_init'];
    var _emscripten_stack_get_free = wasmExports['emscripten_stack_get_free'];
    var _emscripten_stack_get_base = wasmExports['emscripten_stack_get_base'];
    var _emscripten_stack_get_end = wasmExports['emscripten_stack_get_end'];
    var __emscripten_stack_restore = wasmExports['_emscripten_stack_restore'];
    var __emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'];
    var _emscripten_stack_get_current =
      wasmExports['emscripten_stack_get_current'];
    var ___cxa_decrement_exception_refcount = createExportWrapper(
      '__cxa_decrement_exception_refcount',
      1
    );
    var ___cxa_increment_exception_refcount = createExportWrapper(
      '__cxa_increment_exception_refcount',
      1
    );
    var ___thrown_object_from_unwind_exception = createExportWrapper(
      '__thrown_object_from_unwind_exception',
      1
    );
    var ___get_exception_message = createExportWrapper(
      '__get_exception_message',
      3
    );
    Module['emnapiInit'] = emnapiInit;
    var missingLibrarySymbols = [
      'writeI53ToI64',
      'writeI53ToI64Clamped',
      'writeI53ToI64Signaling',
      'writeI53ToU64Clamped',
      'writeI53ToU64Signaling',
      'readI53FromI64',
      'readI53FromU64',
      'convertI32PairToI53',
      'convertI32PairToI53Checked',
      'convertU32PairToI53',
      'getTempRet0',
      'setTempRet0',
      'zeroMemory',
      'getHeapMax',
      'growMemory',
      'inetPton4',
      'inetNtop4',
      'inetPton6',
      'inetNtop6',
      'readSockaddr',
      'writeSockaddr',
      'emscriptenLog',
      'readEmAsmArgs',
      'jstoi_q',
      'listenOnce',
      'autoResumeAudioContext',
      'getDynCaller',
      'dynCall',
      'handleException',
      'runtimeKeepalivePush',
      'runtimeKeepalivePop',
      'callUserCallback',
      'maybeExit',
      'asmjsMangle',
      'alignMemory',
      'HandleAllocator',
      'getNativeTypeSize',
      'addOnInit',
      'addOnPostCtor',
      'addOnPreMain',
      'addOnExit',
      'STACK_SIZE',
      'STACK_ALIGN',
      'POINTER_SIZE',
      'ASSERTIONS',
      'getCFunc',
      'ccall',
      'cwrap',
      'uleb128Encode',
      'sigToWasmTypes',
      'generateFuncType',
      'convertJsFunctionToWasm',
      'getEmptyTableSlot',
      'updateTableMap',
      'getFunctionAddress',
      'addFunction',
      'removeFunction',
      'reallyNegative',
      'unSign',
      'strLen',
      'reSign',
      'formatString',
      'intArrayToString',
      'AsciiToString',
      'UTF16ToString',
      'stringToUTF16',
      'lengthBytesUTF16',
      'UTF32ToString',
      'stringToUTF32',
      'lengthBytesUTF32',
      'stringToNewUTF8',
      'stringToUTF8OnStack',
      'writeArrayToMemory',
      'registerKeyEventCallback',
      'maybeCStringToJsString',
      'findEventTarget',
      'getBoundingClientRect',
      'fillMouseEventData',
      'registerMouseEventCallback',
      'registerWheelEventCallback',
      'registerUiEventCallback',
      'registerFocusEventCallback',
      'fillDeviceOrientationEventData',
      'registerDeviceOrientationEventCallback',
      'fillDeviceMotionEventData',
      'registerDeviceMotionEventCallback',
      'screenOrientation',
      'fillOrientationChangeEventData',
      'registerOrientationChangeEventCallback',
      'fillFullscreenChangeEventData',
      'registerFullscreenChangeEventCallback',
      'JSEvents_requestFullscreen',
      'JSEvents_resizeCanvasForFullscreen',
      'registerRestoreOldStyle',
      'hideEverythingExceptGivenElement',
      'restoreHiddenElements',
      'setLetterbox',
      'softFullscreenResizeWebGLRenderTarget',
      'doRequestFullscreen',
      'fillPointerlockChangeEventData',
      'registerPointerlockChangeEventCallback',
      'registerPointerlockErrorEventCallback',
      'requestPointerLock',
      'fillVisibilityChangeEventData',
      'registerVisibilityChangeEventCallback',
      'registerTouchEventCallback',
      'fillGamepadEventData',
      'registerGamepadEventCallback',
      'registerBeforeUnloadEventCallback',
      'fillBatteryEventData',
      'battery',
      'registerBatteryEventCallback',
      'setCanvasElementSize',
      'getCanvasElementSize',
      'jsStackTrace',
      'getCallstack',
      'convertPCtoSourceLocation',
      'checkWasiClock',
      'wasiRightsToMuslOFlags',
      'wasiOFlagsToMuslOFlags',
      'safeSetTimeout',
      'setImmediateWrapped',
      'safeRequestAnimationFrame',
      'clearImmediateWrapped',
      'registerPostMainLoop',
      'registerPreMainLoop',
      'getPromise',
      'makePromise',
      'idsToPromises',
      'makePromiseCallback',
      'Browser_asyncPrepareDataCounter',
      'isLeapYear',
      'ydayFromDate',
      'arraySum',
      'addDays',
      'getSocketFromFD',
      'getSocketAddress',
      'FS_unlink',
      'FS_mkdirTree',
      '_setNetworkCallback',
      'heapObjectForWebGLType',
      'toTypedArrayIndex',
      'webgl_enable_ANGLE_instanced_arrays',
      'webgl_enable_OES_vertex_array_object',
      'webgl_enable_WEBGL_draw_buffers',
      'webgl_enable_WEBGL_multi_draw',
      'webgl_enable_EXT_polygon_offset_clamp',
      'webgl_enable_EXT_clip_control',
      'webgl_enable_WEBGL_polygon_mode',
      'emscriptenWebGLGet',
      'computeUnpackAlignedImageSize',
      'colorChannelsInGlTextureFormat',
      'emscriptenWebGLGetTexPixelData',
      'emscriptenWebGLGetUniform',
      'webglGetUniformLocation',
      'webglPrepareUniformLocationsBeforeFirstUse',
      'webglGetLeftBracePos',
      'emscriptenWebGLGetVertexAttrib',
      '__glGetActiveAttribOrUniform',
      'writeGLArray',
      'registerWebGlEventCallback',
      'runAndAbortIfError',
      'ALLOC_NORMAL',
      'ALLOC_STACK',
      'allocate',
      'writeStringToMemory',
      'writeAsciiToMemory',
      'demangle',
      'stackTrace',
      'emnapiAddSendListener',
      'emnapiGetMemoryAddress',
      'emnapiSetValueI64',
      'emnapiSyncMemory',
      'emnapiCreateArrayBuffer',
    ];
    missingLibrarySymbols.forEach(missingLibrarySymbol);
    var unexportedSymbols = [
      'run',
      'addRunDependency',
      'removeRunDependency',
      'out',
      'err',
      'callMain',
      'abort',
      'wasmMemory',
      'wasmExports',
      'writeStackCookie',
      'checkStackCookie',
      'INT53_MAX',
      'INT53_MIN',
      'bigintToI53Checked',
      'stackSave',
      'stackRestore',
      'stackAlloc',
      'ptrToString',
      'exitJS',
      'abortOnCannotGrowMemory',
      'ENV',
      'ERRNO_CODES',
      'strError',
      'DNS',
      'Protocols',
      'Sockets',
      'timers',
      'warnOnce',
      'readEmAsmArgsArray',
      'jstoi_s',
      'getExecutableName',
      'keepRuntimeAlive',
      'asyncLoad',
      'mmapAlloc',
      'wasmTable',
      'noExitRuntime',
      'addOnPreRun',
      'addOnPostRun',
      'freeTableIndexes',
      'functionsInTableMap',
      'setValue',
      'getValue',
      'PATH',
      'PATH_FS',
      'UTF8Decoder',
      'UTF8ArrayToString',
      'UTF8ToString',
      'stringToUTF8Array',
      'stringToUTF8',
      'lengthBytesUTF8',
      'intArrayFromString',
      'stringToAscii',
      'UTF16Decoder',
      'JSEvents',
      'specialHTMLTargets',
      'findCanvasEventTarget',
      'currentFullscreenStrategy',
      'restoreOldWindowedStyle',
      'UNWIND_CACHE',
      'ExitStatus',
      'getEnvStrings',
      'doReadv',
      'doWritev',
      'initRandomFill',
      'randomFill',
      'emSetImmediate',
      'emClearImmediate_deps',
      'emClearImmediate',
      'promiseMap',
      'getExceptionMessageCommon',
      'getCppExceptionTag',
      'getCppExceptionThrownObjectFromWebAssemblyException',
      'incrementExceptionRefcount',
      'decrementExceptionRefcount',
      'getExceptionMessage',
      'Browser',
      'getPreloadedImageData__data',
      'wget',
      'MONTH_DAYS_REGULAR',
      'MONTH_DAYS_LEAP',
      'MONTH_DAYS_REGULAR_CUMULATIVE',
      'MONTH_DAYS_LEAP_CUMULATIVE',
      'SYSCALLS',
      'preloadPlugins',
      'FS_createPreloadedFile',
      'FS_modeStringToFlags',
      'FS_getMode',
      'FS_stdin_getChar_buffer',
      'FS_stdin_getChar',
      'FS_createPath',
      'FS_createDevice',
      'FS_readFile',
      'FS',
      'FS_createDataFile',
      'FS_createLazyFile',
      'MEMFS',
      'TTY',
      'PIPEFS',
      'SOCKFS',
      'tempFixedLengthArray',
      'miniTempWebGLFloatBuffers',
      'miniTempWebGLIntBuffers',
      'GL',
      'AL',
      'GLUT',
      'EGL',
      'GLEW',
      'IDBStore',
      'SDL',
      'SDL_gfx',
      'allocateUTF8',
      'allocateUTF8OnStack',
      'print',
      'printErr',
      'emnapiAsyncWorkPoolSize',
      'emnapiCtx',
      'emnapiExternalMemory',
      'emnapiModule',
      'emnapiNodeBinding',
      'emnapiString',
      'emnapiGetHandle',
      'emnapiTSFN',
      'emnapiAWST',
      'emnapiCreateFunction',
      'emnapiDefineProperty',
      'emnapiUnwrap',
      'emnapiWrap',
    ];
    unexportedSymbols.forEach(unexportedRuntimeSymbol);
    var calledRun;
    function stackCheckInit() {
      _emscripten_stack_init();
      writeStackCookie();
    }
    function run() {
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      stackCheckInit();
      preRun();
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      function doRun() {
        assert(!calledRun);
        calledRun = true;
        Module['calledRun'] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        Module['onRuntimeInitialized']?.();
        consumedModuleProp('onRuntimeInitialized');
        assert(
          !Module['_main'],
          'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'
        );
        postRun();
      }
      if (Module['setStatus']) {
        Module['setStatus']('Running...');
        setTimeout(() => {
          setTimeout(() => Module['setStatus'](''), 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
      checkStackCookie();
    }
    function checkUnflushedContent() {
      var oldOut = out;
      var oldErr = err;
      var has = false;
      out = err = (x) => {
        has = true;
      };
      try {
        _fflush(0);
        ['stdout', 'stderr'].forEach((name) => {
          var info = FS.analyzePath('/dev/' + name);
          if (!info) return;
          var stream = info.object;
          var rdev = stream.rdev;
          var tty = TTY.ttys[rdev];
          if (tty?.output?.length) {
            has = true;
          }
        });
      } catch (e) {}
      out = oldOut;
      err = oldErr;
      if (has) {
        warnOnce(
          'stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.'
        );
      }
    }
    if (Module['preInit']) {
      if (typeof Module['preInit'] == 'function')
        Module['preInit'] = [Module['preInit']];
      while (Module['preInit'].length > 0) {
        Module['preInit'].pop()();
      }
    }
    consumedModuleProp('preInit');
    run();
    moduleRtn = readyPromise;
    for (const prop of Object.keys(Module)) {
      if (!(prop in moduleArg)) {
        Object.defineProperty(moduleArg, prop, {
          configurable: true,
          get() {
            abort(
              `Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`
            );
          },
        });
      }
    }

    return moduleRtn;
  };
})();
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = Module;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = Module;
} else if (typeof define === 'function' && define['amd'])
  define([], () => Module);
