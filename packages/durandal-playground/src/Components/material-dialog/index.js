import { MDCDialog } from "@material/dialog";

import viewTemplate from "./material-dialog.html";
import styles from "./material-dialog.scss";

const textField = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const DialogViewModel = function () {
                // Material component - Instantiation
                const dialog = new MDCDialog(componentInfo.element.querySelector(".mdc-dialog"));

                this.styles = styles;

                this.content = params.content;

                this.primaryAction = params.primaryAction;
                this.primaryText = params.primaryText;

                this.secondaryAction = params.secondaryAction;
                this.secondaryText = params.secondaryText;
            };

            return new DialogViewModel();
        },
    },
    template: viewTemplate,
};

export default textField;
