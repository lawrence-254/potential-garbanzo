#!/usr/bin/env node
"use strict";

function newFunction(num) {
  var triangle = '';

  if (num >= 2) {
    for (var i = 0; i < num; i++) {
      for (var j = 0; j < i; j++) {
        triangle += '#';
      }

      triangle += '\n';
    }
  }

  console.log(triangle);
}

newFunction(8);