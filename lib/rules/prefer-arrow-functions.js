/**
 * @fileoverview Rule to prefer arrow functions over plain functions
 * @author Triston Jones
 */

'use strict';

module.exports = {
  meta: {
    docs: {
      description: 'prefer arrow functions',
      category: 'emcascript6',
      recommended: false
    },
    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        disallowPrototype: {
          type: 'boolean'
        }
      },
      additionalProperties: false
    }]
  },
  create: function(context) {
    let stack = [];
    function startScope() {
      stack.push({modifiesPrototype: false});
    } 
    function endScope() {
      return stack.pop();
    }

    return {
      'Program': () => stack = [],
      'FunctionDeclaration': startScope, 
      'FunctionDeclaration:exit': (node) => exit(node, endScope(), context),
      'FunctionExpression': startScope,
      'FunctionExpression:exit': (node) => exit(node, endScope(), context)
    };
  }
}

function isPrototypeAssignment(node) {
  let parent = node.parent;

  while(parent) {
    switch(parent.type) {
      case 'MemberExpression':
        if(parent.property && parent.property.name === 'prototype') 
          return true;
        parent = parent.object;
        break;
      case 'AssignmentExpression':
        parent = parent.left;
        break;
      case 'Property':
      case 'ObjectExpression':
        parent = parent.parent;
        break;
      default: 
        return false;
    }
  }

  return false;
}

function exit(node, info, context) {  
  const disallowPrototype = (context.options[0] || {}).disallowPrototype;
  if(disallowPrototype) return context.report(node, 'Prefer using arrow functions over plain functions');
  
  if(isPrototypeAssignment(node)) return;
  context.report(node, 'Prefer using arrow functions over plain functions');
}