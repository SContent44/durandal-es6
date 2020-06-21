import ko from "knockout";

import { WebpackComponentLoader } from "../utils/component-loader";

const ComponentSetup = () => {
    const context = require.context("./", true, /\.\/[^/_]+\/index\.(j|t)s$/, "lazy");
    ko.components.loaders.unshift(new WebpackComponentLoader(context));
};

export default ComponentSetup;
