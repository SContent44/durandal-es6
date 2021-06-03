const Events = require("./events").default;

describe("Durandal/Events AMD", () => {
    describe("on and trigger", () => {
        let obj = { counter: 0 };
        Events.includeIn(obj);
        obj.on("event", () => {
            obj.counter += 1;
        });

        it("counter should be incremented", () => {
            obj.trigger("event");
            expect(obj.counter).toBe(1);
        });

        it("counter should be incremented five times", () => {
            obj.trigger("event");
            obj.trigger("event");
            obj.trigger("event");
            obj.trigger("event");

            expect(obj.counter).toBe(5);
        });

        it("binding and triggering should support multiple events ", () => {
            obj = { counter: 0 };
            Events.includeIn(obj);

            obj.trigger("event");

            obj.on("a b c", () => {
                obj.counter += 1;
            });

            obj.trigger("a");
            expect(obj.counter).toBe(1);

            obj.trigger("a b");

            expect(obj.counter).toBe(3);

            obj.trigger("c");
            expect(obj.counter).toBe(4);

            obj.off("a c");
            obj.trigger("a b c");
            expect(obj.counter).toBe(5);
        });

        it("should trigger all for each event", () => {
            let a;
            let b;
            const obj = { counter: 0 };
            Events.includeIn(obj);

            obj.on("all", (event) => {
                obj.counter++;
                if (event === "a") {
                    a = true;
                }
                if (event === "b") {
                    b = true;
                }
            }).trigger("a b");
            expect(a).toBeTruthy();
            expect(b).toBeTruthy();
            expect(obj.counter).toBe(2);
        });
    });

    describe("on, then unbind all functions", () => {
        const obj = { counter: 0 };
        Events.includeIn(obj);
        const callback = function () {
            obj.counter += 1;
        };

        obj.on("event", callback);
        obj.trigger("event");
        obj.off("event");
        obj.trigger("event");

        it("counter should have only been incremented once", () => {
            expect(obj.counter).toBe(1);
        });
    });

    describe("bind two callbacks, unbind only one", () => {
        const obj = { counterA: 0, counterB: 0 };
        Events.includeIn(obj);
        const callback = function () {
            obj.counterA += 1;
        };

        obj.on("event", callback);
        obj.on("event", () => {
            obj.counterB += 1;
        });

        obj.trigger("event");
        obj.off("event", callback);
        obj.trigger("event");

        it("counterA should have only been incremented once.", () => {
            expect(obj.counterA).toBe(1);
        });
        it("counterB should have been incremented twice.", () => {
            expect(obj.counterB).toBe(2);
        });
    });

    describe("unbind a callback in the midst of it firing", () => {
        const obj = { counter: 0 };
        Events.includeIn(obj);
        const callback = function () {
            obj.counter += 1;
            obj.off("event", callback);
        };
        obj.on("event", callback);
        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        it("the callback should have been unbound.", () => {
            expect(obj.counter).toBe(1);
        });
    });

    describe("two binds that unbind themselves", () => {
        const obj = { counterA: 0, counterB: 0 };
        Events.includeIn(obj);
        const incrA = function () {
            obj.counterA += 1;
            obj.off("event", incrA);
        };
        const incrB = function () {
            obj.counterB += 1;
            obj.off("event", incrB);
        };
        obj.on("event", incrA);
        obj.on("event", incrB);
        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        it("counterA should have only been incremented once.", () => {
            expect(obj.counterA).toBe(1);
        });
        it("counterA should have only been incremented once..", () => {
            expect(obj.counterB).toBe(1);
        });
    });

    describe("bind a callback with a supplied context", () => {
        const TestClass = function () {
            return this;
        };
        TestClass.prototype.assertTrue = function () {
            it("this` should be bound to the callback`", () => {
                expect(true).toBeTruthy();
            });
        };

        const obj = {};
        Events.includeIn(obj);
        obj.on(
            "event",
            function () {
                this.assertTrue();
            },
            new TestClass()
        );
        obj.trigger("event");
    });

    describe("nested trigger with unbind", () => {
        const obj = { counter: 0 };
        Events.includeIn(obj);

        const incr1 = function () {
            obj.counter += 1;
            obj.off("event", incr1);
            obj.trigger("event");
        };
        const incr2 = function () {
            obj.counter += 1;
        };
        obj.on("event", incr1);
        obj.on("event", incr2);
        obj.trigger("event");
        it("counter should have incremented three times", () => {
            expect(obj.counter).toBe(3);
        });
    });

    describe("callback list is not altered during trigger", () => {
        let counter = 0;
        const obj = {};
        const incr = function () {
            counter++;
        };
        Events.includeIn(obj);

        it("bind should not alter callback list", () => {
            obj.on("event", () => {
                obj.on("event", incr);
                obj.on("all", incr);
            });
            obj.trigger("event");
            expect(counter).toBe(0);
        });

        it("unbind should not alter callback list", () => {
            obj.off();
            obj.on("event", () => {
                obj.off("event", incr);
                obj.off("all", incr);
            });
            obj.on("event", incr);
            obj.on("all", incr);

            obj.trigger("event");

            expect(counter).toBe(2);
        });
    });

    // This test has been x'd out since 2013
    xit("if no callback is provided, `on` should be a noop", () => {
        const obj = {};
        Events.includeIn(obj);
        const result = obj.on("test").trigger("test");
        expect(result).toBeNull();
    });

    // This test has been x'd out since 2013
    xit("if callback is truthy but not a function, `on` should throw an error just like jQuery", () => {
        const view = {};
        Events.includeIn(view);

        view.on("test", "noop");
        view.trigger("test");
    });

    describe("off", () => {
        it("should remove all events for a specific context", () => {
            const obj = {};
            Events.includeIn(obj);

            obj.on("x y all", () => {
                expect(true).toBeTruthy();
            });
            obj.on(
                "x y all",
                () => {
                    expect(false).toBeTruthy();
                },
                obj
            );
            obj.off(null, null, obj);
            obj.trigger("x y");
        });

        it("should remove all events for a specific callback", () => {
            const obj = {};
            Events.includeIn(obj);
            const success = function () {
                expect(true).toBeTruthy();
            };
            const fail = function () {
                expect(false).toBeTruthy();
            };

            obj.on("x y all", success);
            obj.on("x y all", fail);
            obj.off(null, fail);
            obj.trigger("x y");
        });

        it("should not skip consecutive events", () => {
            const obj = {};
            Events.includeIn(obj);
            obj.on(
                "event",
                () => {
                    expect(false).toBeTruthy();
                },
                obj
            );
            obj.on(
                "event",
                () => {
                    expect(false).toBeTruthy();
                },
                obj
            );
            obj.off(null, null, obj);
            obj.trigger("event");
        });
    });

    describe("event functions", () => {
        const obj = {};
        const obj2 = {};
        const fn = function () {
            expect(true).toBeTruthy();
        };
        Events.includeIn(obj);
        Events.includeIn(obj2);

        it("should be chainable", () => {
            expect(obj).toEqual(obj.trigger("noeventssetyet"));
            expect(obj).toEqual(obj.off("noeventssetyet"));
            expect(obj).toEqual(obj.on("a", fn));
            expect(obj).toEqual(obj.trigger("a"));
            expect(obj).toEqual(obj.off("a"));
        });
    });
});
