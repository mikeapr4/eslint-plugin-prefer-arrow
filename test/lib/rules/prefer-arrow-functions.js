/**
 * @fileoverview Tests for prefer-arrow-functions rule.
 * @author Triston Jones
 */

'use strict';

const singleReturnOnly = (code, extraRuleOptions) => ({
  code,
  options: [Object.assign({singleReturnOnly: true}, extraRuleOptions)],
  parserOptions: {sourceType: 'module'}
});

var rule = require('../../../lib/rules/prefer-arrow-functions'),
    RuleTester = require('eslint').RuleTester;

var tester = new RuleTester({parserOptions: {ecmaVersion: 6}});
tester.run('lib/rules/prefer-arrow-functions', rule, {
  parserOptions: {ecmaVersion: 6},
  valid: [
    'var foo = (bar) => bar;',
    'var foo = bar => bar;',
    'var foo = bar => { return bar; }',
    'var foo = () => 1;',
    'var foo = (bar, fuzz) => bar + fuzz',
    '["Hello", "World"].reduce((p, a) => p + " " + a);',
    'var foo = (...args) => args',
    'class obj {constructor(foo){this.foo = foo;}}; obj.prototype.func = function() {};',
    'class obj {constructor(foo){this.foo = foo;}}; obj.prototype = {func: function() {}};',
    ...[
      'var foo = (bar) => {return bar();}',
      'function foo(bar) {bar()}',
      'var x = function foo(bar) {bar()}',
      'var x = function(bar) {bar()}',
      'function foo(bar) {/* yo */ bar()}',
      'function foo() {}',
      'function foo(bar) {bar(); return bar()}',
      'class MyClass { foo(bar) {bar(); return bar()} }',
      'var MyClass = { foo(bar) {bar(); return bar()} }',
      'export default function xyz() { return 3; }',
      'class MyClass { render(a, b) { return 3; } }'
    ].map(singleReturnOnly)
  ],
  invalid: [
    {code: 'function foo() { return "Hello!"; }', errors: ['Use const or class constructors instead of named functions']},
    {code: 'function foo() { return arguments; }', errors: ['Use const or class constructors instead of named functions']},
    {code: 'var foo = function() { return "World"; }', errors: ['Prefer using arrow functions over plain functions']},
    {code: '["Hello", "World"].reduce(function(a, b) { return a + " " + b; })', errors: ['Prefer using arrow functions over plain functions']},
    {code: 'class obj {constructor(foo){this.foo = foo;}}; obj.prototype.func = function() {};', errors: ['Prefer using arrow functions over plain functions'], options: [{disallowPrototype:true}]},
    ...[
      // Make sure it works with ES6 classes & functions declared in object literals
      ['class MyClass { render(a, b) { return 3; } }', 'class MyClass { render = (a, b) => 3; }', {classPropertiesAllowed: true}],
      ['var MyClass = { render(a, b) { return 3; }, b: false }', 'var MyClass = { render: (a, b) => 3, b: false }'],

      // Make sure named function declarations work
      ['function foo() { return 3; }', 'const foo = () => 3;'],
      ['function foo(a) { return 3 }', 'const foo = (a) => 3;'],
      ['function foo(a) { return 3; }', 'const foo = (a) => 3;'],

      // Eslint treats export default as a special form of function declaration
      ['export default function() { return 3; }', 'export default () => 3;'],

      // Sanity check - make sure complex logic works
      ['function foo(a) { return a && (3 + a()) ? true : 99; }', 'const foo = (a) => a && (3 + a()) ? true : 99;'],

      // Make sure function expressions work
      ['var foo = function() { return "World"; }', 'var foo = () => "World"'],
      ['var foo = function() { return "World"; };', 'var foo = () => "World";'],
      ['var foo = function x() { return "World"; };', 'var foo = () => "World";'],

      // Make sure we wrap object literal returns in parens
      ['var foo = function() { return {a: false} }', 'var foo = () => ({a: false})'],
      ['var foo = function() { return {a: false}; }', 'var foo = () => ({a: false})'],
      ['function foo(a) { return {a: false}; }', 'const foo = (a) => ({a: false});'],
      ['function foo(a) { return {a: false} }', 'const foo = (a) => ({a: false});'],

      // Make sure we treat inner functions properly
      ['var foo = function () { return function(a) { a() } }', 'var foo = () => function(a) { a() }'],
      ['var foo = function () { return () => false }', 'var foo = () => () => false'],

      // Make sure we don't obliterate comments/whitespace and only remove newlines when appropriate
      ['var foo = function() {\n  return "World";\n}', 'var foo = () => "World"'],
      ['var foo = function() {\n  return "World"\n}', 'var foo = () => "World"'],
      ['function foo(a) {\n  return 3;\n}', 'const foo = (a) => 3;'],
      ['function foo(a) {\n  return 3\n}', 'const foo = (a) => 3;'],
      [
        '/*1*/var/*2*/ /*3*/foo/*4*/ /*5*/=/*6*/ /*7*/function/*8*/ /*9*/x/*10*/(/*11*/a/*12*/, /*13*/b/*14*/)/*15*/ /*16*/{/*17*/ /*18*/return/*19*/ /*20*/false/*21*/;/*22*/ /*23*/}/*24*/;/*25*/',
        '/*1*/var/*2*/ /*3*/foo/*4*/ /*5*/=/*6*/ /*7*//*8*/ /*9*//*10*/(/*11*/a/*12*/, /*13*/b/*14*/)/*15*/ /*16*/=> /*17*/ /*18*//*19*/ /*20*/false/*21*//*22*/ /*23*//*24*/;/*25*/',
      ],
      [
        '/*1*/function/*2*/ /*3*/foo/*4*/(/*5*/a/*6*/)/*7*/ /*8*/\{/*9*/ /*10*/return/*11*/ /*12*/false/*13*/;/*14*/ /*15*/}/*16*/',
        '/*1*/const/*2*/ /*3*/foo/*4*/ = (/*5*/a/*6*/)/*7*/ /*8*/=> /*9*/ /*10*//*11*/ /*12*/false/*13*//*14*/ /*15*/;/*16*/'
      ]
    ].map(inputOutput => Object.assign(
      {
        errors: ['Prefer using arrow functions over plain functions which only return a value'],
        output: inputOutput[1]
      },
      singleReturnOnly(inputOutput[0], inputOutput[2])
    ))
  ]
});
