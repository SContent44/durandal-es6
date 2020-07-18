const ko = require("knockout");
const sut = require("./binder").default;
const system = require("./system").default;

const isSpy = (spy) => spy.calls && typeof spy.calls.count === "function";

describe("durandal/binder", function () {
    let settings;
    let view;

    function sharedBindingBehaviour(createSettings, sutAction) {
        const insufficientInfoMessage = "Insufficient Information to Bind";
        const unexpectedViewMessage = "Unexpected View Type";
        const viewName = "view name";

        beforeEach(function () {
            settings = createSettings();

            view = {
                getAttribute() {
                    return viewName;
                },
            };

            sut.throwOnErrors = false;

            if (!isSpy(ko.applyBindings)) {
                jest.spyOn(ko, "applyBindings");
            }

            if (!isSpy(system.error)) {
                jest.spyOn(system, "error").mockImplementation(function (errorMessage) {
                    throw errorMessage;
                });
            }

            jest.spyOn(system, "log");
        });

        it("logs and returns with null view", function () {
            view = null;

            sutAction();

            expect(system.log).toHaveBeenCalled();
            expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
        });

        it("logs and returns with null obj", function () {
            settings.bindingTarget = null;

            sutAction();

            expect(system.log).toHaveBeenCalled();
            expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
        });

        it("logs and returns with no getAttribute function on view", function () {
            view.getAttribute = null;

            sutAction();

            expect(system.log).toHaveBeenCalled();
            expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
        });

        it("applies bindings with before and after hooks", function () {
            let bindStatus = 0;
            jest.spyOn(sut, "binding").mockImplementation(function (dataArg, viewArg) {
                expect(dataArg).toBe(settings.data);
                expect(viewArg).toBe(view);
                expect(bindStatus).toBe(0);
                bindStatus = 1;
            });
            /* spyOn(sut, "binding").and.callFake(function (dataArg, viewArg) {
                expect(dataArg).toBe(settings.data);
                expect(viewArg).toBe(view);
                expect(bindStatus).toBe(0);
                bindStatus = 1;
            }); */
            ko.applyBindings.mockImplementation(function () {
                expect(bindStatus).toBe(1);
                bindStatus = 2;
            });
            jest.spyOn(sut, "bindingComplete").mockImplementation(function (dataArg, viewArg) {
                expect(dataArg).toBe(settings.data);
                expect(viewArg).toBe(view);
                expect(bindStatus).toBe(2);
            });

            sutAction();

            expect(system.log).toHaveBeenCalled();
            expect(ko.applyBindings).toHaveBeenCalledWith(settings.bindingTarget, view);
        });

        it("logs binding error", function () {
            ko.applyBindings.mockImplementation(function () {
                throw new Error("FakeError");
            });

            sutAction();

            expect(system.log).toHaveBeenCalled();
        });

        describe("with throw errors set", function () {
            beforeEach(function () {
                sut.throwOnErrors = true;
            });

            it("throws and returns with null view", function () {
                view = null;

                expect(function () {
                    sutAction();
                }).toThrowError(insufficientInfoMessage);
                expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
            });

            it("throws and returns with null obj", function () {
                settings.bindingTarget = null;

                expect(function () {
                    sutAction();
                }).toThrowError(insufficientInfoMessage);
                expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
            });

            it("throws and returns with no getAttribute function on view", function () {
                view.getAttribute = null;

                expect(function () {
                    sutAction();
                }).toThrowError(unexpectedViewMessage);
                expect(ko.applyBindings).not.toHaveBeenCalledWith(settings.bindingTarget, view);
            });

            it("throws binding error", function () {
                ko.applyBindings.mockImplementation(function () {
                    throw new Error("FakeError");
                });

                expect(function () {
                    sutAction();
                }).toThrowError(/.*/);
            });
        });
    }

    describe("bind", function () {
        function createSettings() {
            const target = {};
            return {
                obj: target,
                bindingTarget: target,
                data: target,
            };
        }

        sharedBindingBehaviour(createSettings, function () {
            sut.bind(settings.bindingTarget, view);
        });
    });

    describe("bindContext", function () {
        describe("child context used", function () {
            function createSettings() {
                const bindingObject = {};
                const bindingContext = {
                    $data: bindingObject,
                    createChildContext() {
                        return bindingContext;
                    },
                };

                return {
                    obj: bindingObject,
                    bindingTarget: bindingContext,
                    data: bindingObject,
                };
            }

            sharedBindingBehaviour(createSettings, function () {
                sut.bindContext(settings.bindingTarget, view, settings.data);
            });
        });

        describe("child context not used", function () {
            function createSettings() {
                const bindingObject = {};
                const bindingContext = {
                    $data: bindingObject,
                    createChildContext() {
                        return bindingObject;
                    },
                };
                return {
                    obj: bindingObject,
                    bindingTarget: bindingContext,
                    data: bindingObject,
                };
            }

            sharedBindingBehaviour(createSettings, function () {
                sut.bindContext(settings.bindingTarget, view, null);
            });
        });
    });
});
