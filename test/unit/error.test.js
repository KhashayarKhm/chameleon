const { expect } = require('chai');
const { conditionalErrorMessage, modificationErrorMessage } = require('../../src/utils/error');

describe('error.js', function() {
	describe('conditionalErrorMessage', function() {
		const args = [
			{
				elementName: undefined,
				correctType: undefined,
				typeFound: undefined,
			},
			{
				elementName: null,
				correctType: 12,
				typeFound: 'bar',
			},
			{
				elementName: 5,
				correctType: null,
				typeFound: {}, // We couldn't set `Object.create(null)` https://github.com/lodash/lodash/issues/5454
			},
			{
				elementName: 'foo',
				correctType: false,
				typeFound: null,
			},
		];

		it('should return a string with any arguments', function() {
			args.forEach(({ elementName, correctType, typeFound }) => {
				expect(conditionalErrorMessage(elementName, correctType, typeFound)).to.be.a('string');
			});
		});
	});

	describe('modificationErrorMessage', function() {
		const args = [
			{
				elementName: 46,
				inputValue: undefined,
			},
			{
				elementName: undefined,
				inputValue: 'lorem',
			},
			{
				elementName: Symbol('test'),
				inputValue: {}, // We couldn't set `Object.create(null)` https://github.com/lodash/lodash/issues/5454
			},
			{
				elementName: {}, // We couldn't set `Object.create(null)` https://github.com/lodash/lodash/issues/5454
				inputValue: Object('baz'),
			},
		];

		it('should return a string with any arguments', function() {
			args.forEach(({ elementName, inputValue }) => {
				expect(modificationErrorMessage(elementName, inputValue)).to.be.a('string');
			});
		});
	});
});
