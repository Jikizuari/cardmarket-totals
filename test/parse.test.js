const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseAmount, parseQuantity, detectFormat, formatAmount } = require('../src/parse.js');

test('parses amounts in cents, whatever the notation', () => {
	assert.equal(parseAmount('15,69 €'), 1569);
	assert.equal(parseAmount('1.234,56 €'), 123456);
	assert.equal(parseAmount('€ 1,234.56'), 123456);
	assert.equal(parseAmount('3,1 €'), 310);
	assert.equal(parseAmount('12 €'), 1200);
	assert.equal(parseAmount('1.234 €'), 123400);
	assert.equal(parseAmount('1 234,50 €'), 123450);
	assert.equal(parseAmount(''), null);
});

test('parses quantities', () => {
	assert.equal(parseQuantity(' 12 '), 12);
	assert.equal(parseQuantity(''), 0);
});

test('formats a total the same way the page does', () => {
	assert.equal(formatAmount(59810, detectFormat('15,69 €')), '598,10 €');
	assert.equal(formatAmount(123456, detectFormat('15,69 €')), '1.234,56 €');
	assert.equal(formatAmount(123456, detectFormat('€ 15.69')), '€ 1,234.56');
	assert.equal(formatAmount(5, detectFormat('15,69 €')), '0,05 €');
});
