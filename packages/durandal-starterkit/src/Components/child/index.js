import viewTemplate from "./child.html";
import "./child.css";

const child = {
    viewModel(params) {
        this.childValue = params.childValue;
    },
    template: viewTemplate,
};

export default child;
