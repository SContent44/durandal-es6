import { MDCTextField } from "@material/textfield";
import { MDCNotchedOutline } from "@material/notched-outline";

import viewTemplate from "./material-textfield.html";
import styles from "./material-textfield.scss";

const textField = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const TextFieldVM = function () {
                // do an enum?
                this.fieldTypes = {
                    filled: 0,
                    outlined: 1,
                };
                this.fieldType = params.fieldType || "filled";

                // Get the correct element based on which part of template component will use
                const textFieldElement = componentInfo.element.querySelectorAll(".mdc-text-field")[
                    this.fieldTypes[this.fieldType]
                ];
                const textField = new MDCTextField(textFieldElement);

                if (this.fieldType === "outlined") {
                    const notchedOutlineElement = componentInfo.element.querySelector(".mdc-notched-outline");
                    const notchedOutline = new MDCNotchedOutline(notchedOutlineElement);
                }

                this.styles = styles;

                this.label = params.label || "Textfield Default Label";
                this.isVisible = params.isVisible || true;

                this.inputValue = params.inputValue;

                // We need add some css classes if the value is already prefilled without user interaction
                if (this.inputValue() && this.inputValue().toString().length > 0) {
                    //
                    textFieldElement.classList.add("mdc-text-field--label-floating");

                    if (this.fieldType === "outlined") {
                        textFieldElement
                            .querySelector(".mdc-notched-outline")
                            .classList.add("mdc-notched-outline--notched");
                    }
                    // Make the label float
                    textFieldElement
                        .querySelector(".mdc-floating-label")
                        .classList.add("mdc-floating-label--float-above");
                }
            };

            return new TextFieldVM();
        },
    },
    template: viewTemplate,
};

export default textField;
