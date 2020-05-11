import viewTemplate from "./parent.html";
import "./parent.css";

const parent = {
    /** Viewmodel
     * @type { function }
     */
    viewModel(params) {
        this.parentValue = params.parentValue;
        this.childValue = params.childValue;
    },

    /** Template for the view
     * @type { html }
     */
    template: viewTemplate,
};

export default parent;
