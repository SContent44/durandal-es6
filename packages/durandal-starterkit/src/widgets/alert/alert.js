import ko from "knockout";
import viewTemplate from "./alert.html";

class AlertViewModel {
    constructor() {
        this.view = viewTemplate;
        this.moduleName = "AlertViewModel";

        this.variant = ko.observable("");
        this.text = ko.observable("");
        this.title = ko.observable("");
        this.canClose = ko.observable(true);
        this.className = ko.pureComputed(() => {
            const classes = [`alert-${this.variant()}`];

            if (this.canClose()) {
                classes.push("alert-dismissable");
            }

            return classes.join(" ");
        }, this);
    }

    activate(settings) {
        this.variant(settings.variant || "danger");
        this.text(settings.text);
        this.title(settings.title);
        this.canClose(settings.canClose !== false);
    }
}

export default AlertViewModel;
