import viewTemplate from "./grandparent.html";
import "./grandparent.css";

const grandparent = {
    viewModel(params) {
        this.grandparentValue = params.grandparentValue;
        this.parentValue = params.parentValue;
        this.childValue = params.childValue;
    },
    template: viewTemplate,
};

export default grandparent;
