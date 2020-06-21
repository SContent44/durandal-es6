import { MDCRipple } from "@material/ripple";
import viewTemplate from "./material-card.html";
import styles from "./material-card.scss";

const button = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const testVM = function () {
                const selector = ".mdc-button, .mdc-icon-button, .mdc-card__primary-action";
                const ripples = [].map.call(componentInfo.element.querySelectorAll(selector), function (el) {
                    return new MDCRipple(el);
                });

                this.styles = styles;

                this.isVisible = params.isVisible || true;
            };

            return new testVM();
        },
    },
    template: viewTemplate,
};

export default button;
