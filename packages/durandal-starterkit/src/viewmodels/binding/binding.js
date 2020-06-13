import ko from "knockout";

import viewTemplate from "./binding.html";
import dynamicTemplate from "./dynamic.html";

function BindingViewModel() {
    this.view = viewTemplate;

    // Composing a view that does not have it's own viewmodel by just passing view in directly.
    this.sharedVMScreen = dynamicTemplate;

    this.someData = ko.pureComputed(() => {
        return this.sharedInput();
    }, this);

    // Function that returns object
    this.ownVMScreen = () => {
        const obj = {
            model: {
                someData: ko.pureComputed(() => {
                    return this.ownInput();
                }, this),
                viewName: "ownVMScreen",
            },
            view: dynamicTemplate,
        };
        return obj;
    };

    // Input for each of the someData values
    this.sharedInput = ko.observable("Shares parent context").extend({
        required: true,
    });

    this.ownInput = ko.observable("Own binding context").extend({
        required: true,
    });

    this.anotherOwnVMScreenObject = {
        view: dynamicTemplate,
        model: {
            someData: ko.pureComputed(() => {
                return this.ownInput();
            }, this),
            viewName: "Another own VM screen",
        },
    };

    this.anotherOwnVMScreenFunction = function () {
        this.someData = ko.pureComputed(() => {
            return "Can use a function with its own this context";
        }, this);
        this.viewName = "Another own VM screen";
        this.view = dynamicTemplate;
    };
}

const Binding = new BindingViewModel();

export default Binding;
