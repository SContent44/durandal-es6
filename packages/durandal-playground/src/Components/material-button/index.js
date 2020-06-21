import { MDCRipple } from "@material/ripple";
import viewTemplate from "./material-button.html";
import styles from "./material-button.scss";

const ButtonComponent = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const ButtonViewModel = function () {
                this.buttonRipple = new MDCRipple(componentInfo.element.querySelector(".mdc-button"));
                this.styles = styles;

                this.text = params.text || "Button";
                this.action = params.action;
                this.isVisible = params.isVisible || true;
            };

            return new ButtonViewModel();
        },
    },
    template: viewTemplate,
};

export default ButtonComponent;
