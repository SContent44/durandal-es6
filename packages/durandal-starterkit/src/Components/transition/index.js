import ko from "knockout";
import template from "./transition.html";
import css from "./transition.css";
import { app } from "durandal/core";

const transition = {
    viewModel: {
        createViewModel(params, componentInfo) {
            const vm = {
                transitionStyle: ko.observable("animated waitForAnimate"),
                viewPrimed: ko.observable(false),
            };

            const sub = ko.bindingEvent.subscribe(
                componentInfo.element, // element we're bound to
                "descendantsComplete", // lifeCycle function we're binding to
                (node) => {
                    vm.viewPrimed(true);
                }
            );

            const transitionIn = () => {
                vm.transitionStyle("animated slow fadeIn");
            };

            vm.transitionSet = ko
                .computed(() => {
                    if (vm.viewPrimed()) {
                        ko.ignoreDependencies(transitionIn);
                    }
                })
                .extend({ deferred: true });

            vm.dispose = () => {
                sub.dispose();
            };

            return vm;
        },
    },
    template,
};

export default transition;
