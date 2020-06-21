import viewTemplate from "./child.html";
import styles from "./child.css";

const child = {
    viewModel(params) {
        this.childValue = params.childValue;
        this.styles = styles;
    },
    template: viewTemplate,
};

export default child;
