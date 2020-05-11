import * as ko from "knockout";
import viewTemplate from "./ko-components.html";

function ComponentViewModel() {
    this.view = viewTemplate;
    this.grandparentInput = ko.observable("Grandparent Name").extend({
        required: true,
    });

    this.parentInput = ko.observable("Parent Name").extend({
        required: true,
    });

    this.childInput = ko.observable("Child Name").extend({
        required: true,
    });

    this.grandparentDisplay = ko.pureComputed(() => {
        return this.grandparentInput();
    }, this);

    this.parentDisplay = ko.pureComputed(() => {
        return this.parentInput();
    }, this);

    this.childDisplay = ko.pureComputed(() => {
        return this.childInput();
    }, this);
}

const Component = new ComponentViewModel();

export default Component;
