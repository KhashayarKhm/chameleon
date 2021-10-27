module.exports = {
	mode: 'jit',
	purge: {
		enable: true,
		content: [
			'./src/**/*.js',
			'./src/**/*.css',
		],
	},
	darkMode: false,
	theme: {
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
