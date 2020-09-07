// Object containing all of the widgets we wish to install
const Alert = function Alert() {
    return import("./alert/alert").then((module) => {
        return module.default;
    });
};

export default {
    kinds: [Alert],
};
