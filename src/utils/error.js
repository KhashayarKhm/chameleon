import { toString } from 'lodash';

/**
 * Generate type error message.
 *
 * @param {string} elementName
 * @param {string} correctType
 * @param {string} typeFound
 */
export function conditionalErrorMessage(elementName, correctType, typeFound) {
	return `The ${toString(elementName)} should be ${toString(correctType)} but found ${toString(typeFound)}\n`
		.concat('Please report us this error here\n')
		.concat('https://github.com/KhashayarKhm/chameleon/issues');
}

/**
 * Generate range error message.
 *
 * @param {string} elementName
 * @param {*} inputValue
 */
export function modificationErrorMessage(elementName, inputValue) {
	return `Unexpected ${toString(elementName)}. (Invalid value: ${toString(inputValue)})`
		.concat('\nPlease DO NOT change the styles, classes or IDs of the elements')
		.concat('\nIf you don\'t please tell us this error here https://github.com/KhashayarKhm/chameleon/issues')
		.concat('\nOtherwise restart and try again.');
}
