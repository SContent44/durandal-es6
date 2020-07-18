const router = require("./router").default;

describe("plugins/router", function () {
    describe("parseQueryString", function () {
        it("returns null when the queryString parameter is an empty string", function () {
            const res = router.parseQueryString("");
            expect(res).toBeNull();
        });

        it("returns null when the queryString parameter is null", function () {
            const res = router.parseQueryString(null);
            expect(res).toBeNull();
        });

        it('returns object when queryString = "a=1"', function () {
            const res = router.parseQueryString("a=1");
            const exp = { a: "1" };
            expect(res).toEqual(exp);
        });

        it('returns object when queryString = "a=1&b=2"', function () {
            const res = router.parseQueryString("a=1&b=2");
            const exp = { a: "1", b: "2" };
            expect(res).toEqual(exp);
        });

        it('returns object when queryString = "a=1&b=2&b=3"', function () {
            const res = router.parseQueryString("a=1&b=2&b=3");
            const exp = { a: "1", b: ["2", "3"] };
            expect(res).toEqual(exp);
        });
    });
});
