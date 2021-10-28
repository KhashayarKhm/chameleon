import _ from 'lodash';
import {
	conditionalErrorMessage,
	modificationErrorMessage,
} from './error';

/**
 * @typedef LineState
 * @type {Object}
 * @property {string[]} colors - Colors the used in the line.
 * @property {number} accuracy - Accuracy of the colors in the line.
 * @property {number} index - Index of the line.
 */

/**
 * Extract the states from line element.
 *
 * @param {HTMLLIElement} element
 * @param {number} indexOfElement
 * @returns {LineState}
 */
function getLineState(element, indexOfElement) {
	if (!_.isElement(element)) {
		throw new TypeError(conditionalErrorMessage(
			'line element',
			'HTMLLIElement',
			_.result(element, 'constructor.name'),
		));
	} else if (element.className !== 'line') {
		throw new RangeError(modificationErrorMessage(
			`line element with ${indexOfElement} index`,
			element.className,
		));
	} else if (!Number.isInteger(indexOfElement) || !_.inRange(indexOfElement, 12)) {
		throw new RangeError(conditionalErrorMessage(
			'element index',
			'a integer between 0 and 11',
			indexOfElement,
		));
	}
	const items = Array(...(element.querySelectorAll('span')));
	if (items.length !== 9) {
		throw new RangeError(modificationErrorMessage('spots length', items.length));
	}
	const pops = items.filter((node, index) => index !== 0 && index < 5);
	const indicators = items.filter((node, index) => index >= 5);
	const indexes = _.range(4);
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	return indexes
		.reduce(
			(state, index) => {
				if (!['pop', 'spot'].includes(pops[index].classList[0])) {
					throw new RangeError(modificationErrorMessage('spot class name', pops[index].classList[0]));
				}
				return _.set(state, 'colors', state.colors.concat(
					allColors.find((color) => color === pops[index].classList[1]),
				));
			},
			indexes.reduce(
				(state, index) => {
					const firstIndicatorClass = indicators[index].classList[0];
					switch (firstIndicatorClass) {
						case 'hit':
							return _.set(state, 'accuracy', state.accuracy + 5);
						case 'almost':
							return _.set(state, 'accuracy', state.accuracy + 1);
						case 'indicator':
							return _.set(state, 'accuracy', state.accuracy + 0);
						default:
							throw new RangeError(modificationErrorMessage(
								'indicator',
								firstIndicatorClass,
							));
					}
				},
				{
					index: indexOfElement,
					colors: [],
					accuracy: 0,
				},
			),
		);
}

/**
 * Get the line(s) state.
 *
 * @param {number} index
 * @returns {LineState}
 */
function getLine(index) {
	const lineIndex = Math.floor(index);
	const lines = document.querySelectorAll('section.wrap-game > ul#board > li.line');
	if (typeof index === 'number' && _.inRange(lineIndex, 12)) {
		return getLineState(lines[lineIndex], lineIndex);
	}
	const activeLineIndex = 11 - Array(...lines).reverse()
		.findIndex((lineElement) => lineElement.querySelectorAll('.pop').length === 4);
	return getLineState(lines[activeLineIndex], activeLineIndex);
}

/**
 * Insert color to the active line.
 *
 * @param {string} color
 */
function insertColor(color) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (typeof color !== 'string') {
		throw new TypeError(conditionalErrorMessage(
			'color',
			allColors,
			color,
		));
	} else if (!allColors.includes(color)) {
		throw new RangeError(modificationErrorMessage('color', color));
	}
	const targetColorButton = document
		.querySelector(`section.wrap-game > ul#colorOptions.color-Options > li#${color}.option.${color}`);
	if (targetColorButton) {
		targetColorButton.click();
	} else {
		throw new ReferenceError(modificationErrorMessage(
			'color button',
			targetColorButton,
		));
	}
}

/**
 * Find the useless color;
 *
 * @param {number|string[]} [start=0] - Index of line to start searching or list of used colors
 * @returns {?string}
 */
function getUselessColor(start = 0) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (Array.isArray(start) && start.every((value) => allColors.includes(value))) {
		return _.xor(allColors, start)[0];
	}
	if (!Number.isInteger(start) || !_.inRange(start, 12)) {
		throw new RangeError(conditionalErrorMessage(
			'start index',
			'a integer between 0 to 11(or it can be a list of colors)',
			start,
		));
	}
	const line = getLine(start);
	if (line.colors.every((color) => allColors.includes(color))) {
		if (line.accuracy === 0) {
			return line.colors[3];
		}
		return getUselessColor(start + 1);
	}
	return null;
}

/**
 * Create new colors possibility positions with entered conditions
 *
 * @param {string[][]} cpp - colors possibility positions
 * @param {string} targetColor
 * @param {LineState|0} lineState - if the line state equal to 0 means that force remove from CPP
 * @param {number[]} insertedColorPositions
 * @param {boolean} [pointwise=false] - if it's true,
 it will just clear the inserted color positions for exact color
 *
 * @returns {string[][]}
 */
function modifyColorsPossibilityPositions(
	cpp,
	targetColor,
	lineState,
	insertedColorPositions,
	pointwise = false,
) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (
		!Array.isArray(cpp)
		|| !cpp.every((possibleColorsList) => Array.isArray(possibleColorsList)
			&& possibleColorsList.every((color) => allColors.includes(color)))
	) {
		throw new TypeError(conditionalErrorMessage(
			'colors possibility positions list',
			'a list(Array) of positions(Array) that includes colors(string)',
			cpp,
		));
	} else if (!allColors.includes(targetColor)) {
		throw new TypeError(conditionalErrorMessage(
			'targetColor',
			`one of these colors ${allColors}`,
			targetColor,
		));
	} else if (
		lineState !== 0
		&& (!_.isPlainObject(lineState)
		|| !_.every(lineState, (value, key) => {
			switch (key) {
				case 'accuracy':
					return Number.isInteger(value) && _.inRange(value, 21);
				case 'colors':
					return Array.isArray(value) && value.length === 4
						&& value.every((color) => allColors.includes(color));
				case 'index':
					return Number.isInteger(value) && _.inRange(value, 12);
				default:
					throw new TypeError(`Unexpected key in line state object. (${key})`);
			}
		}))
	) {
		throw new TypeError(conditionalErrorMessage(
			'line state',
			'object with score(number in 0 to 20 range), colors(string[]), index(number in 0 to 11 range)',
			lineState,
		));
	} else if (
		lineState !== 0
		&& (!Array.isArray(insertedColorPositions)
		|| !insertedColorPositions
			.every((position) => Number.isInteger(position) && _.inRange(position, 4)))
	) {
		throw new TypeError(conditionalErrorMessage(
			'inserted color positions',
			'a list of indexes in 0 to 3',
			insertedColorPositions,
		));
	}
	if (!lineState || (lineState && !lineState.accuracy)) {
		return cpp.map((possibleColorsList) => possibleColorsList
			.filter((possibleColor) => possibleColor !== targetColor));
	}
	return cpp.map((possibleColorsList, position) => {
		if (insertedColorPositions.length * 5 === lineState.accuracy) {
			if (pointwise) {
				return insertedColorPositions.includes(position)
					? possibleColorsList.filter((possibleColor) => possibleColor === targetColor)
					: possibleColorsList;
			}
			return possibleColorsList
				.filter((possibleColor) => (insertedColorPositions.includes(position)
					? (possibleColor === targetColor)
					: (possibleColor !== targetColor)));
		}
		if (lineState.accuracy < 5) {
			return insertedColorPositions.includes(position)
				? possibleColorsList.filter((possibleColor) => possibleColor !== targetColor)
				: possibleColorsList;
		}
		return possibleColorsList;
	});
}

/**
 * Find the colors that used
 *
 * @return {{ usedColors: Object, colorsPossibilityPositions: string[][] }}
 */
function findColors() {
	const colorList = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	return colorList.reduce((state, color) => {
		const blanks = 4 - Object.values(state.usedColors)
			.reduce((overall, number) => overall + number, 0);
		if (!blanks) {
			return _.set(
				state,
				'colorsPossibilityPositions',
				modifyColorsPossibilityPositions(
					state.colorsPossibilityPositions,
					color,
					0,
				),
			);
		}
		if (color === 'blue') {
			return _.set(state, ['usedColors', color], blanks);
		}
		const uselessColor = getUselessColor();
		// The reduce fuction insert color and generate inserted color position list too
		const insertedColorPositions = _.range(4).reduce((icp, index) => {
			if (uselessColor && index >= blanks) {
				insertColor(uselessColor);
				return icp;
			}
			insertColor(color);
			return icp.concat(index);
		}, []);
		const lineState = getLine();
		const correctSpots = Math.floor(lineState.accuracy / 5) + (lineState.accuracy % 5);
		return _.set(
			lineState.accuracy ? _.set(state, ['usedColors', color], correctSpots) : state,
			'colorsPossibilityPositions',
			modifyColorsPossibilityPositions(
				state.colorsPossibilityPositions,
				color,
				lineState,
				insertedColorPositions,
			),
		);
	}, { usedColors: {}, colorsPossibilityPositions: _.range(4).map(() => colorList) });
}

/**
 * Checks the game status.
 *
 * @returns {boolean}
 */
function checkStatus() {
	const spots = Array(...document.querySelectorAll('section.wrap-game > ul#codeSoluce.code-Soluce > li'));
	if (spots.length === 4) {
		if (spots.every((element) => element.className === 'soluce')) {
			return false;
		}
		if (spots.every((element) => ['black', 'white', 'red', 'orange', 'yellow', 'blue']
			.includes(element.className))) {
			return true;
		}
		throw new ReferenceError(modificationErrorMessage(
			'solution spots class name',
			spots.find((element) => !['black', 'white', 'red', 'orange', 'yellow', 'blue']
				.includes(element.className)).className,
		));
	} else {
		throw new ReferenceError(modificationErrorMessage('solution spots length', spots.length));
	}
}

/**
 * Find the best color that can get the correct position in minimum time.
 *
 * @param {string[][]} cpp - Colors Possibility Positions
 * @param {Object} usedColors
 *
 * @return {string}
 */
function findBestColor(cpp, usedColors) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (!Array.isArray(cpp) || !cpp.every((possibleColorsList) => Array.isArray(possibleColorsList)
		|| possibleColorsList.every((color) => allColors.includes(color)))) {
		throw new RangeError(conditionalErrorMessage(
			'colors possibility positions',
			'an list of color(string) lists',
			cpp,
		));
	} else if (
		!_.isPlainObject(usedColors)
		|| !_.every(usedColors, (number) => Number.isInteger(number) && _.inRange(number, 1, 5))
		|| _.reduce(usedColors, (overall, number) => overall + number, 0) !== 4
	) {
		throw new RangeError(conditionalErrorMessage(
			'used colors',
			'an object that keyed with colors with an integer value between 1 to 4(the overall should be 4)',
			usedColors,
		));
	}
	const colorsScore = _.mergeWith(
		_.countBy(cpp.flat()),
		usedColors,
		(allColorsPositionsValue, usedColorsValue) => allColorsPositionsValue - usedColorsValue,
	);
	return _.reduce(colorsScore, (bestColor, score, color) => (
		(colorsScore[bestColor] || Number.MAX_SAFE_INTEGER) > (score || Number.MAX_SAFE_INTEGER)
			? color : bestColor
	), null);
}

/**
 * Generate insert list.
 *
 * @param {string[][]} cpp - Colors Possibility Positions
 * @param {number} insertedColorPosition - It should be an integer between 0 to 3 but if it be -1,
 it search the position that have two options and choose the exact color that should be here.
 if does't found these conditions throw an error
 * @param {Object} usedColors
 * @param {number} targetColor
 */
function generateInsertList(cpp, insertedColorPosition, usedColors, targetColor) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (!Array.isArray(cpp) || !cpp.every((possibleColorsList) => possibleColorsList
		.every((color) => allColors.includes(color)))) {
		throw new TypeError(conditionalErrorMessage(
			'color possibility positions',
			'a list of color(string) lists',
			cpp,
		));
	} else if (!_.inRange(insertedColorPosition, -1, 4)) {
		throw new RangeError(conditionalErrorMessage(
			'inserted color position',
			'a number between 0 to 3',
			insertedColorPosition,
		));
	} else if (
		!_.isPlainObject(usedColors)
		|| !_.every(usedColors, (number) => Number.isInteger(number) && _.inRange(number, 1, 5))
		|| _.reduce(usedColors, (overall, number) => overall + number, 0) !== 4
	) {
		throw new RangeError(conditionalErrorMessage(
			'used colors',
			'an object that keyed with colors with an integer value between 1 to 4(the overall should be 4)',
			usedColors,
		));
	} else if (insertedColorPosition !== -1 && !allColors.includes(targetColor)) {
		throw new RangeError(conditionalErrorMessage(
			'color',
			`one of these colors ${allColors}`,
			targetColor,
		));
	}
	const exactColors = _.result(_.countBy(cpp, 'length'), '1', 0);
	if (exactColors === 3) {
		return cpp.map((possibleColorsList) => {
			if (possibleColorsList.length === 1) return possibleColorsList[0];
			return usedColors[possibleColorsList[0]] < _.countBy(cpp.flat())[possibleColorsList[0]]
				? possibleColorsList[1] : possibleColorsList[0];
		});
	}
	if (insertedColorPosition === -1) {
		throw new RangeError(conditionalErrorMessage(
			'inserted color position',
			'a number between 0 to 3',
			'-1 and there is not any position with two options or exact color for it',
		));
	}
	return _.set(
		Array(4).fill(getUselessColor(Object.keys(usedColors))),
		insertedColorPosition,
		targetColor,
	);
}

/**
 * Decode the game
 *
 * @param {Object} usedColors
 * @param {string[][]} cpp - Colors Possibility Positions
 */
function decode(usedColors, cpp) {
	const allColors = ['black', 'white', 'red', 'orange', 'yellow', 'blue'];
	if (
		!_.isPlainObject(usedColors) || !Array.isArray(cpp)
		|| (
			!_.every(usedColors, (number) => Number.isInteger(number) && _.inRange(number, 1, 5))
			&& _.reduce(usedColors, (overall, number) => overall + number, 0) !== 4
		)
		|| !cpp.every((possibleColorsList) => possibleColorsList
			.every((color) => allColors.includes(color)))
	) {
		const findColorsResult = findColors();
		decode(
			findColorsResult.usedColors,
			findColorsResult.colorsPossibilityPositions,
		);
	}
	if (cpp) {
		if (cpp.every((possibleColorsList) => possibleColorsList.length === 1)) {
			cpp.flat().forEach((color) => insertColor(color));
			return checkStatus();
		}
	} else {
		return checkStatus();
	}
	const targetColor = findBestColor(cpp, usedColors);
	const insertedColorPosition = cpp.findIndex((possibleColorsList) => {
		if (possibleColorsList.length === 1) return false;
		return possibleColorsList.includes(targetColor);
	});
	generateInsertList(cpp, insertedColorPosition, usedColors, targetColor)
		.forEach((color) => insertColor(color));
	const lastUsedLine = getLine();
	if (checkStatus()) return true;
	if (lastUsedLine.index >= 11) return false;
	return decode(
		usedColors,
		modifyColorsPossibilityPositions(
			cpp,
			targetColor,
			lastUsedLine,
			[insertedColorPosition],
			usedColors[targetColor] !== 1,
		),
	);
}

export default {
	decode,
};
