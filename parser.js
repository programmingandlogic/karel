/**
 * Parses basic Java code purely for functions and functions being called
 **/

'use strict';

const AST_REGEX        = /([\w();]+)/gi;
const AST_IS_FUNC_CALL = /\(\);/i;
const AST_IS_WHILE     = /^\s*while/g;
const AST_IS_FOR       = /^\s*for/g;
const AST_IS_INT       = /^\s*int/g;
const AST_IS_STR       = /^\s*str/g;

// node requires
const fs      = require('fs');
const Natives = require('./natives.js');
const World   = require('./world.js');

// instances.
const natives = new Natives();
const world   = new World('./worlds');

// world handling
let worldTable = world.parse('CollectNewspaperKarel');

let   res  = fs.readFileSync('CollectNewspaperKarel.java', 'utf8');

      // remove comments
      res = res.replace(/\/\/([\w\d\ "!@#$%^&*()_+:.\-,]+)/ig, '');
      res = res.replace(/\/\*([\w\d\s"!@#$%^&*()_+:.\-,]+)\*\//gi, '');

      // pre-format } end blocks
      res = res.replace(/\}/igm, 'endBlock');

      // convert while/for/int/str to mem spaces.
      let fori=0;
      res = res.replace(AST_IS_FOR, function() {

      })

// internal functions
const executeFunction = function(funcName) {
  if(functions.declared.indexOf(funcName) === -1 && !natives[funcName]) {
    console.log('Function isn\'t defined!');
    return 'FUNC_NOT_DEFINED';
  }

  // define function to this pointer.
  let funcPointer = functions.contents[funcName];

  if(!funcPointer && !natives[funcName]) {
    console.log('error: not defined');
    return 'FUNC_NOT_DEFINED';
  }

  // don't allow override of native funs
  if(natives[funcName] !== undefined) {
    let nativeFuncPoint = natives[funcName];

    // check if the native function is defined.
    if(nativeFuncPoint === undefined) {
        return 'NATIVE_NOT_DEFINED';
    }

    if(nativeFuncPoint(world, worldTable) === false) {
      console.log('Failed!')
      process.exit(1);
    }

    return;
  }

  funcPointer.forEach(function(v) {
    console.log('execute function:', v);
    return executeFunction(v);
  });
}

// strip comments
const matches = res.match(AST_REGEX)
// console.log(matches);

let functions  = {
  declared: [],
  contents: {}
}

let isFunction = false;
let isVar      = false;
let isClass    = false;
let isClassExt = false;
let mapFunc    = false;
let blockDepth = 0;
matches.forEach((v) => {
  // just in case.
  v = v.toString('ascii');

  // previous conditions checks
  if(isFunction) {
    isFunction = false;

    let funcName = v.replace('()', '');

    // up the block depth
    blockDepth++;
    mapFunc = funcName;

    functions.declared.push(funcName);
    functions.contents[mapFunc] = [];

    console.log('declare void:', funcName);
    return;
  } else if(isClass) {
    isClass = false;
    console.log('class declared:', v);
    return;
  } else if(isClassExt) {
    isClassExt = false;
    console.log('class extends:', v);
    return;
  }

  // add func calls to their respective scopes
  let isScopedFunc = AST_IS_FUNC_CALL.test(v);
  if(isScopedFunc) {
    let funcName = v.replace('();', '');

    console.log('add to function:', funcName);
    functions.contents[mapFunc].push(funcName);
    return;
  } else if(v === 'endBlock') {
    blockDepth--;
    mapFunc = false;
    console.log('block ended');
    return;
  }

  // get types
  if(v === 'void') {
    isFunction = true;
  } else if(v === 'class') {
    blockDepth++;
    isClass = true;
  } else if(v === 'extends') {
    isClassExt = true;
  } else if(v === 'import' || v === 'public' || v === 'private') {
    return
  } else {
    console.log('\nNOTICE  : UNDEFINED TOKEN CAUGHT')
    console.log('is a function call:', isScopedFunc);
    console.log('is func call replace:', v.replace(AST_IS_FUNC_CALL, ''))
    console.log('text:', v);
    console.log('ENDNOTICE\n')
  }
});

// essentially our "main"
console.log('\n\nexecuting run')
executeFunction('run');

console.log(matches);
