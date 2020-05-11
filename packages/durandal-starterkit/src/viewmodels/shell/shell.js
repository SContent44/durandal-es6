import { app } from "durandal/core";
import router from "durandal/plugins/router";

import viewTemplate from "./shell.html";
import routes from "../routes";

class ShellViewModel {
    constructor() {
        this.view = viewTemplate;
        this.viewName = "Shell";
    }

    // eslint-disable-next-line class-methods-use-this
    search() {
        // It's really easy to show a message box.
        // You can add custom options too. Also, it returns a promise for the user's response.
        app.showMessage("Search not yet implemented...");
    }

    // eslint-disable-next-line class-methods-use-this
    activate() {
        router.map(routes).buildNavigationModel();

        return router.activate();
    }
}

const Shell = new ShellViewModel();

export default Shell;
