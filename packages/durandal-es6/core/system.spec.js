const sut = require("./system").default;

describe("durandal/system", function () {
    describe("debug", function () {
        test("returns false when no arguments", function () {
            var isDebugging = sut.debug();

            expect(isDebugging).toBe(false);
        });

        test("sets debug value", function () {
            sut.debug(true);
            var isDebugging = sut.debug();

            expect(isDebugging).toBe(true);
        });
    });
});
