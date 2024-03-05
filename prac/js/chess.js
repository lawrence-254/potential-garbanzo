#!/usr/bin/env node
var r = '';
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        r += (i + j) % 2 ? ' ' : '#';
    }
    r += '\n';
}
console.log(r);
