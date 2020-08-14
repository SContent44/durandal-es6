import ko from "knockout";
import { app } from "durandal/core";
import { router } from "durandal/plugins";

import viewTemplate from "./shell.html";
import routes from "../routes";

class ShellViewModel {
    constructor() {
        this.view = viewTemplate;
        this.modelName = "ShellViewModel";

        this.router = router;
        this.isExpanded = ko.observable(false);
        this.toggle = () => {
            this.isExpanded(!this.isExpanded());
        };

        router.on("router:navigation:composition-complete").then(() => {
            const toggleInput = document.getElementsByClassName("navbar-toggle")[0];
            if (toggleInput && this.isExpanded()) {
                toggleInput.click();
            }
            return true;
        });
    }

    // eslint-disable-next-line class-methods-use-this
    search() {
        // It's really easy to show a message box.
        // You can add custom options too. Also, it returns a promise for the user's response.
        app.showMessage("Search not yet implemented...");
    }

    // eslint-disable-next-line class-methods-use-this
    activate() {
        const redirectObject = {
            moduleId: () => {
                return {
                    view: "<p>Not found object</p>",
                };
            },
        };

        const redirectFunction = (instruction) => {
            const returnedInstruction = instruction;

            returnedInstruction.config.moduleId = () => {
                return {
                    view: "<p>Not found function</p>",
                };
            };

            return returnedInstruction;
        };

        router.map(routes).buildNavigationModel().mapUnknownRoutes();

        return router.activate();
    }
}

const Shell = new ShellViewModel();

export default Shell;
