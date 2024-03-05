#!/usr/bin/env node


function newFunction(num) {
    let triangle = '';
    if (num >= 2) {

        for (let i = 0; i < num; i++) {
            for (let j = 0; j < i; j++) {
                triangle += '#'
            }
            triangle += '\n'
        }

    }
    console.log(triangle);
}

newFunction(8);