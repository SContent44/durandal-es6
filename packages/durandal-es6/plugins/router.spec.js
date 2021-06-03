const router = require("./router").default;

describe("plugins/router", () => {
    describe("parseQueryString", () => {
        it("returns null when the queryString parameter is an empty string", () => {
            const res = router.parseQueryString("");
            expect(res).toBeNull();
        });

        it("returns null when the queryString parameter is null", () => {
            const res = router.parseQueryString(null);
            expect(res).toBeNull();
        });

        it('returns object when queryString = "a=1"', () => {
            const res = router.parseQueryString("a=1");
            const exp = { a: "1" };
            expect(res).toEqual(exp);
        });

        it('returns object when queryString = "a=1&b=2"', () => {
            const res = router.parseQueryString("a=1&b=2");
            const exp = { a: "1", b: "2" };
            expect(res).toEqual(exp);
        });

        it('returns object when queryString = "a=1&b=2&b=3"', () => {
            const res = router.parseQueryString("a=1&b=2&b=3");
            const exp = { a: "1", b: ["2", "3"] };
            expect(res).toEqual(exp);
        });
    });
});
