import _ from 'lodash';
import { conditionalErrorMessage } from './error';
import logoURI from '../assets/logo.svg';
import '../styles/style.css';

/**
 * Generate the element.
 *
 * @param {} nodeObject
 * @param {('http://www.w3.org/1999/xhtml'|'http://www.w3.org/2000/svg')} namespace
 * @returns {HTMLLIElement}
 */
function renderElement(nodeObject, namespace = 'http://www.w3.org/1999/xhtml') {
	if (!_.isPlainObject(nodeObject)) {
		throw new TypeError(conditionalErrorMessage(
			'node object',
			'an object',
			_.result(nodeObject, 'constructor.name'),
		));
	} else if (namespace !== 'http://www.w3.org/1999/xhtml' && namespace !== 'http://www.w3.org/2000/svg') {
		throw new TypeError(conditionalErrorMessage(
			'element namespace',
			'http://www.w3.org/1999/xhtml or http://www.w3.org/2000/svg',
			namespace,
		));
	} else if (!Object.keys(nodeObject).includes('tagName')) {
		throw new ReferenceError('\'tag name\' is not defined');
	} else if (typeof nodeObject.tagName !== 'string') {
		throw new TypeError(conditionalErrorMessage(
			'element tag name',
			'string',
			typeof nodeObject,
		));
	}
	const element = document.createElementNS(namespace, nodeObject.tagName);
	_.forEach(_.omit(nodeObject, 'tagName'), (value, attribute) => {
		const typeofValue = typeof value;
		switch (attribute) {
			case 'content':
				if (typeofValue !== 'number' && typeofValue !== 'string') {
					throw new TypeError(conditionalErrorMessage(
						'element content',
						'string or number',
						typeofValue,
					));
				}
				element.textContent = value;
				break;
			case 'className':
				if (value) {
					if (typeofValue === 'string') {
						element.classList.add(value);
					} else if (Array.isArray(value)) {
						value.forEach((className) => element.classList.add(className));
					} else {
						throw new TypeError(conditionalErrorMessage(
							'element class name',
							'string or a list of strings',
							_.result(value, 'constructor.name'),
						));
					}
				}
				break;
			case 'idName':
				if (value) {
					if (typeofValue !== 'string' && typeofValue !== 'number') {
						throw new TypeError(conditionalErrorMessage(
							'element id name',
							'string or number',
							typeofValue,
						));
					}
					element.setAttribute('id', value);
				}
				break;
			case '$children':
				if (value) {
					if (_.isElement(value)) {
						element.appendChild(value);
					} else if (Array.isArray(value) && value.every((item) => _.isElement(item))) {
						value.forEach((item) => element.appendChild(item));
					} else {
						throw new TypeError(conditionalErrorMessage(
							'element children',
							'element or list of elements',
							_.result(value, 'constructor.name'),
						));
					}
				}
				break;
			case '$event':
				if (value) {
					if (_.isPlainObject(value)) {
						_.forIn(value, (eventFunction, event) => {
							if (_.isFunction(eventFunction)) {
								element.addEventListener(event, eventFunction);
							} else {
								throw new TypeError(conditionalErrorMessage(
									`${event} event`,
									'function',
									_.result(eventFunction, 'constructor.name'),
								));
							}
						});
					} else {
						throw new TypeError(conditionalErrorMessage(
							'event prop',
							'object',
							value,
						));
					}
				}
				break;
			default:
				// Custom attribute
				if (value && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
					throw new TypeError(conditionalErrorMessage(
						'element custom attribute',
						'string, number, boolean or nullish',
						_.result(value, 'constructor.name'),
					));
				}
				element.setAttribute(attribute, value);
		}
	});
	return element;
}

/**
 * Animate the element.
 *
 * @param {HTMLLIElement} targetElement
 * @param {?(string|string[])} className - Class name to animate
 * @param {HTMLLIElement} [parentElement=targetElement.parentElement] - The parent element
 of target element(does NOT need when remove = true)
 * @param {number} [delay=0] - Delay to start animation(to milliseconds)
 * @param {boolean} [remove=false] - If it's "true", remove the element(default is "false")
 * @returns {?Promise} - resolves when the animation ended
 */
function animate(
	targetElement,
	className,
	parentElement = targetElement.parentElement,
	delay = 0,
	remove = false,
) {
	if (!_.isElement(targetElement)) {
		throw new TypeError(conditionalErrorMessage(
			'target animation element',
			'HTML element',
			_.result(targetElement, 'constructor.name'),
		));
	} else if (!_.isElement(parentElement)) {
		throw new TypeError(conditionalErrorMessage(
			'parent of target animation element',
			'HTML element',
			_.result(parentElement, 'constructor.name'),
		));
	}
	if (typeof className === 'string' || className.every((name) => typeof name === 'string')) {
		targetElement.addEventListener('animationend', () => {
			setTimeout(() => {
				if (remove) {
					parentElement.removeChild(targetElement);
				} else if (Array.isArray(className)) {
					className.forEach((name) => targetElement.classList.remove(name));
				} else {
					targetElement.classList.remove(className);
				}
			}, delay + (remove ? 1000 : 0)); /* BUG */
		}, { once: true });
		setTimeout(() => {
			if (Array.isArray(className)) {
				className.forEach((name) => targetElement.classList.add(name));
			} else {
				targetElement.classList.add(className);
			}
			if (!remove) {
				parentElement.appendChild(targetElement);
			}
		}, delay);
	} else if (remove) {
		parentElement.removeChild(targetElement);
	} else {
		parentElement.appendChild(targetElement);
	}
}

/**
 * Init and render the required elements.
 */
function init(decodeFunction) {
	animate(
		renderElement({
			tagName: 'div',
			idName: 'chameleon-container',
			$children: [
				renderElement({
					tagName: 'a',
					href: 'https://github.com/KhashayarKhm/chameleon',
					className: 'logo',
					$children: [
						renderElement({
							tagName: 'img',
							src: logoURI,
						}),
					],
				}),
				renderElement({
					tagName: 'span',
					content: 'v1.0.1',
					className: 'version',
				}),
				renderElement({
					tagName: 'button',
					className: 'decode-btn',
					content: 'Decode',
					$event: {
						click: function onClick(event) {
							event.target.insertAdjacentElement(
								'beforebegin',
								renderElement({
									tagName: 'div',
									className: ['animate__animated', 'btn-ping'],
									$event: {
										animationend: function onAnimationEnd(animationEvent) {
											animationEvent.target.parentNode.removeChild(animationEvent.target);
										},
									},
								}),
							);
							decodeFunction();
						},
					},
				}),
			],
		}),
		['animate__animated', 'animate__bounceIn'],
		document.body,
	);
}

export default {
	init,
};
