/* eslint-disable func-names */
import system from "../core/system";
import helper from "./transitionHelper";

const settings = {
    inAnimation: "slideInRight faster",
    outAnimation: "fadeOut faster",
};

const fadeIn = function (context) {
    system.extend(context, settings);
    return helper.create(context);
};

export default fadeIn;
