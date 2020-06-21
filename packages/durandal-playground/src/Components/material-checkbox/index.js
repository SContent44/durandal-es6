import { MDCFormField } from "@material/form-field";
import { MDCCheckbox } from "@material/checkbox";

import viewTemplate from "./material-checkbox.html";
import styles from "./material-checkbox.scss";

const button = {
    viewModel(params) {
        this.styles = styles;

        this.checkbox = new MDCCheckbox(document.querySelector(".mdc-checkbox"));
        this.formField = new MDCFormField(document.querySelector(".mdc-form-field"));
        this.formField.input = this.checkbox;

        this.label = params.label || "Checkbox Default Text";
        this.labelVisible = params.labelVisible !== undefined ? params.labelVisible : true;
        this.checked = params.checked;
        this.isVisible = params.isVisible || true;
    },
    template: viewTemplate,
};

export default button;
