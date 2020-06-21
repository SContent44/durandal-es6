import ko from "knockout";
import { MDCList } from "@material/list";
import viewTemplate from "./material-list.html";
import styles from "./material-list.scss";

const listComponent = {
    viewModel(params) {
        // The Material Component and styles
        this.list = new MDCList(document.querySelector(".mdc-list"));
        this.styles = styles;

        // Component data
        this.items = ko.pureComputed(() => {
            return ko.utils.unwrapObservable(params.inputArray);
        });
    },
    template: viewTemplate,
};

export default listComponent;
