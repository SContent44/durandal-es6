import system from "../core/system";
import helper from "./transitionHelper";

const settings = {
    inAnimation: "fadeIn",
    outAnimation: "fadeOut",
};

const fadeIn = (context) => {
    system.extend(context, settings);
    return helper.create(context);
};

export default fadeIn;
