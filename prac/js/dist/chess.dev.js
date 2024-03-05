#!/usr/bin/env node
"use strict";

var r = '';

for (var i = 0; i < 8; i++) {
  for (var j = 0; j < 8; j++) {
    r += (i + j) % 2 ? ' ' : '#';
  }

  r += '\n';
}

console.log(r);