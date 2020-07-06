// Object containing all of the widgets we wish to install
const Alert = function Alert() {
    return import("./alert/alert");
};

export default {
    kinds: [{ name: "Alert", model: Alert }],
};
