import { MDCRipple } from "@material/ripple";

import viewTemplate from "./material-icon-button.html";
import styles from "./material-icon-button.scss";

const textField = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const IconButtonViewModel = function () {
                // Material component - Instantiation
                const iconButtonRipple = new MDCRipple(componentInfo.element.querySelector(".mdc-icon-button"));
                iconButtonRipple.unbounded = true;

                this.styles = styles;

                this.isVisible = params.isVisible || true;

                this.icon = params.icon;
            };

            return new IconButtonViewModel();
        },
    },
    template: viewTemplate,
};

export default textField;
