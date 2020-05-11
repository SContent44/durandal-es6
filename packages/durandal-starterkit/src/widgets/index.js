// Object containing all of the widgets we wish to install
export default {
    kinds: [
        function Alert() {
            return import("./alert/alert");
        },
    ],
};
