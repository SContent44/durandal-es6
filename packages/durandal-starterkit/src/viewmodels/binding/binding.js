import ko from "knockout";

import viewTemplate from "./binding.html";
import dynamicTemplate from "./dynamic.html";

function BindingViewModel() {
    this.view = viewTemplate;
    this.modelName = "BindingViewModel";

    // Input for each of the someData values
    this.sharedInput = ko.observable("Shares parent context").extend({
        required: true,
    });

    const ownInputHelper = ko.observable("Own binding context").extend({
        required: true,
    });
    this.ownInput = ownInputHelper;

    // Composing a view that does not have it's own viewmodel by just passing view in directly.
    this.sharedVMScreen = () => {
        return import("./dynamic.html").then((module) => {
            return module.default;
        });
    };

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
                modelName: "The own VM screen binding model",
            },
            view: dynamicTemplate,
        };
        return obj;
    };

    this.anotherOwnVMScreenObject = {
        view: dynamicTemplate,
        model: Promise.resolve({
            someData: ko.pureComputed(() => {
                return this.ownInput();
            }, this),
            modelName: "The another own VM screen binding model",
        }),
    };

    this.anotherOwnVMScreenFunction = Promise.resolve(function () {
        this.someData = ko.pureComputed(() => {
            return ownInputHelper();
        }, this);
        this.viewName = "Another own VM screen";
        this.view = dynamicTemplate;
        this.modelName = "Another as a function model";
    });
}

const Binding = new BindingViewModel();

export default Binding;
