#!/usr/bin/env node
/**
 * length methods
 */
const fruits = [];
fruits.push('orange', 'banana', 'apple')
console.log(fruits);
console.log(fruits.length);
console.log('end sec 1');
fruits[5] = "peach";
console.log(fruits);
console.log(fruits.length);
console.log(Object.keys(fruits));
console.log('end sec 2');
fruits.length = 10;
console.log(fruits);
console.log(fruits.length);
console.log(Object.keys(fruits));
console.log('end sec 3');
// fruits.length = 2;
// console.log(fruits);
// console.log(fruits.length);
// console.log(Object.keys(fruits));
// console.log('end sec 4');

fruits.forEach((item, index) => {
    console.log(`${index} ${item}`);
})
console.log('------------end sec 5-------------');
rf = fruits.toReversed();
rf.forEach((item, index) => {
    console.log(`${index} ${item}`);
})
