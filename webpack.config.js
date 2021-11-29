const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const Tailwindcss = require('tailwindcss');
const PostcssPresetEnv = require('postcss-preset-env');

const isDevMode = process.env.NODE_ENV === 'development';

module.exports = {
	entry: isDevMode ? {
		chameleon: path.resolve(__dirname, 'src', 'main.js'),
		hot: 'webpack/hot/dev-server.js',
		client: 'webpack-dev-server/client/index.js?hot=true&live-reload=true',
	} : path.resolve(__dirname, 'src', 'main.js'),
	output: {
		filename: isDevMode ? '[name].js' : 'chameleon.js',
		clean: true,
		path: path.resolve(__dirname, 'docs', 'chameleon-source'),
	},
	mode: isDevMode ? 'development' : 'production',
	devtool: 'source-map',
	devServer: {
		static: {
			directory: path.resolve(__dirname, 'docs'),
			publicPath: '/chameleon',
		},
		hot: false,
		client: false,
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					sourceMap: true,
				},
			}),
		],
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									PostcssPresetEnv,
									Tailwindcss(path.resolve(__dirname, 'tailwind.config.js')),
									Autoprefixer,
								],
							},
						},
					},
				],
			},
			{
				test: /\.svg$/,
				type: 'asset/inline',
			},
		],
	},
	plugins: [
		new ESLintPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
};
