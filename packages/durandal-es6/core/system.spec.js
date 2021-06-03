const sut = require("./system").default;

describe("durandal/system", () => {
    describe("debug", () => {
        test("returns false when no arguments", () => {
            const isDebugging = sut.debug();

            expect(isDebugging).toBe(false);
        });

        test("sets debug value", () => {
            sut.debug(true);
            const isDebugging = sut.debug();

            expect(isDebugging).toBe(true);
        });
    });
});
