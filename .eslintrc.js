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
    },
    settings: {
        "import/resolver": {
            webpack: {
                config: "../durandal-starterkit/webpack.config.js",
            },
        },
    },
};
