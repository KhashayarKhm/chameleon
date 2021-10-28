/**
 * Generate type error message.
 *
 * @param {string} elementName
 * @param {string} correctType
 * @param {string} typeFound
 */
function conditionalErrorMessage(elementName, correctType, typeFound) {
	return `The ${elementName} should be ${correctType} but found ${typeFound}\n`
		.concat('Please report us this error here\n')
		.concat('https://github.com/KhashayarKhm/chameleon/issues');
}

/**
 * Generate range error message.
 *
 * @param {string} elementName
 * @param {*} inputValue
 */
function modificationErrorMessage(elementName, inputValue) {
	return `Unexpected ${elementName}. (Invalid value: ${inputValue})`
		.concat('\nPlease DO NOT change the styles, classes or IDs of the elements')
		.concat('\nIf you don\'t please tell us this error here https://github.com/KhashayarKhm/chameleon/issues')
		.concat('\nOtherwise restart and try again.');
}

export {
	conditionalErrorMessage,
	modificationErrorMessage,
};
