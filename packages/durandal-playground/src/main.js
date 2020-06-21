import $ from "jquery";
import "jquery-migrate";

import ko from "knockout";
// eslint-disable-next-line no-unused-vars
import validation from "knockout.validation";

import { app, system } from "durandal/core";
import router from "durandal/plugins/router";

import ComponentSetup from "./Components";
import Shell from "./viewmodels/shell/shell";

import "css/material-basic.scss";

//import "css/ie10mobile.css";
//import "css/starterkit.css";
//import "durandal/css/durandal.css";
//import "lib/font-awesome/css/font-awesome.min.css";
//
//import "bootstrap/dist/css/bootstrap.min.css";
//import "bootstrap/dist/js/bootstrap.min";

// Install widgets
import widgets from "./widgets";

// Webpack sets this __DEV__ variable. See `webpack.config.js` file
// eslint-disable-next-line no-undef
if (__DEV__) {
    system.debug(true);

    window.ko = ko;
    window.app = app;
    window.router = router;
}

app.title = "Durandal Starter Kit";

app.configurePlugins({
    router: true,
    dialog: true,
    widget: widgets,
});

ko.bindingHandlers.uniqueId = {
    init(element, valueAccessor) {
        const value = valueAccessor();
        value.id = value.id || ko.bindingHandlers.uniqueId.prefix + (ko.bindingHandlers.uniqueId.counter += 1);

        element.id = value.id;
    },
    counter: 0,
    prefix: "unique",
};

ko.bindingHandlers.uniqueFor = {
    init(element, valueAccessor) {
        const value = valueAccessor();
        value.id = value.id || ko.bindingHandlers.uniqueId.prefix + (ko.bindingHandlers.uniqueId.counter += 1);

        element.setAttribute("for", value.id);
    },
};

// Register components
ComponentSetup();

ko.options.deferUpdates = true;

// Start the appliction
app.start().then(() => {
    // Show the app by setting the root view model for our application with a transition.
    return app.setRoot(Shell);
});
