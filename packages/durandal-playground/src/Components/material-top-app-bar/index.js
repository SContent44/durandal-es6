import ko from "knockout";
import { MDCTopAppBar } from "@material/top-app-bar";
import { MDCDrawer } from "@material/drawer";

import router from "durandal/plugins/router";

import viewTemplate from "./material-top-app-bar.html";
import styles from "./material-top-app-bar.scss";

const textField = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const TopAppBarViewModel = function () {
                // Material component - Instantiation
                const topAppBarEl = componentInfo.element.querySelector(".mdc-top-app-bar");
                const topAppBar = new MDCTopAppBar(topAppBarEl);
                const drawer = new MDCDrawer(componentInfo.element.querySelector(".mdc-drawer"));

                const mainContentEl = document.querySelector(".main-content");

                // Drawer functionality
                topAppBar.setScrollTarget(mainContentEl);
                topAppBar.listen("MDCTopAppBar:nav", () => {
                    drawer.open = !drawer.open;
                });

                // Accessibility functionality
                const listEl = componentInfo.element.querySelector(".mdc-drawer .mdc-list");
                listEl.addEventListener("click", (event) => {
                    drawer.open = false;
                });

                // TODO Check if any additional behaviour around autofocus is needed

                // Component options

                this.styles = styles;

                this.isVisible = params.isVisible || true;

                // TODO make this a user defined object
                this.navigationModel = router.navigationModel;
                this.activeItem = ko.pureComputed(() => {
                    return this.navigationModel().find((item) => item.isActive());
                });

                this.pageTitle = ko.pureComputed(() => {
                    return this.activeItem().title;
                });
            };

            return new TopAppBarViewModel();
        },
    },
    template: viewTemplate,
};

export default textField;
