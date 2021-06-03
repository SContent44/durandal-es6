module.exports = {
    env: {
        browser: true,
        es6: true,
        jest: true,
    },
    extends: ["airbnb-base", "prettier"],
    plugins: ["prettier"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 2015,
        sourceType: "module",
    },
    rules: {
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto",
            },
        ],
        "guard-for-in": "off",
        "func-names": "off",
        eqeqeq: "off",
        "no-underscore-dangle": "off",
        "no-param-reassign": "off",
        "no-use-before-define": "off",
        "no-cond-assign": "off",
        "no-multi-assign": "off",
        "consistent-return": "off",
        "no-useless-escape": "off",
        "no-plusplus": "off",
        "no-shadow": "off",
        "prefer-rest-params": "off",
        "prefer-spread": "off",
        "no-restricted-syntax": "off",
        "no-continue": "off",
        "no-self-assign": "off",
        "no-bitwise": "off",
        "no-console": "off",
        "prefer-const": "off",
        "new-cap": "off",
        "no-unused-vars": "off",
    },
    settings: {
        "import/resolver": {
            webpack: {
                config: "../durandal-starterkit/webpack.config.js",
            },
        },
    },
};
