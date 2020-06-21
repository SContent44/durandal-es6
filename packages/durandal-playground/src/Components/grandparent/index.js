import viewTemplate from "./grandparent.html";
import styles from "./grandparent.css";

const grandparent = {
    viewModel(params) {
        this.grandparentValue = params.grandparentValue;
        this.parentValue = params.parentValue;
        this.childValue = params.childValue;
        this.styles = styles;
    },
    template: viewTemplate,
};

export default grandparent;
