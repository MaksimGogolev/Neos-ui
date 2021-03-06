const fs = require('fs');
const merge = require('lodash.merge');
const {
    baseConfig,
    hostConfig,
    inspectorEditorConfig
} = require('./webpack.base.config');
const babelConfig = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));

const testConfig = {
    devtool: 'inline-source-map',

    module: {
        preLoaders: [
            //
            // Since the coverage of karma doesn't relate to the ES2015 source files,
            // we need to use the isparta loader which will handle the generation of ES2015 coverage metrics.
            //
            // Since the `.spec.js` should not be included in the coverage metrics, they will be compiled
            // traditionally via `babel` instead.
            //
            // Note: Isparta itself uses babel as well, so all changes in the `.babelrc` will be reflected in
            // the test suite as well.
            //
            {
                test: /\.spec.js$/,
                loader: 'babel'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)\/|\.spec.js$/,
                loader: 'isparta'
            }
        ],

        loaders: baseConfig.module.loaders.concat(
            //
            // Workaround for sinon since it requires itself,
            // and webpack can't handle circular dependencies.
            //
            // @see https://github.com/webpack/webpack/issues/177
            //
            {
                test: /sinon\/pkg\/sinon\.js/,
                loader: 'imports?define=>false,require=>false'
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        )
    },

    isparta: {
        embedSource: true,
        noAutoWrap: true,
        babel: babelConfig
    },

    externals: {
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
    }
};

module.exports = [
    merge({}, baseConfig, hostConfig, testConfig),
    merge({}, baseConfig, inspectorEditorConfig, testConfig)
];
