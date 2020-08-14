/* eslint-disable no-undef */
const $ = require("jquery");
const sut = require("./viewEngine").default;
const system = require("./system").default;

describe("durandal/viewEngine", function () {
    describe("isViewUrl", function () {
        it("returns false when view extension not found", function () {
            const isViewUrl = sut.isViewUrl("test");

            expect(isViewUrl).toBe(false);
        });

        it("returns true when view extension found", function () {
            const isViewUrl = sut.isViewUrl("test.html");

            expect(isViewUrl).toBe(true);
        });
    });

    describe("processMarkup", function () {
        describe("with single node", function () {
            it("returns dom element", function () {
                const markup = sut.processMarkup("<div>test</div>");

                expect(markup.nodeType).toBe(1);
                /**
                 * JSDOM does not implement innerText  because innerText leans
                 * on the layout engine for guidance and jsdom has no layout engine
                 * */
                expect(markup.textContent).toBe("test");
                expect(markup.childNodes[0].nodeType).toBe(3);
            });
        });

        describe("with multiple nodes", function () {
            it("returns wrapped dom element", function () {
                const markup = sut.processMarkup("<div>test</div><div>test</div>");

                expect(markup.className).toBe("durandal-wrapper");
                expect(markup.childNodes.length).toBe(2);
            });
        });

        describe("with comments", function () {
            it("returns dom element with comments removed", function () {
                const markup = sut.processMarkup("<!-- this is a comment --><div>test</div>");

                expect(markup.nodeType).toBe(1);
                expect(markup.textContent).toBe("test");
                expect(markup.childNodes[0].nodeType).toBe(3);
            });
        });
    });

    describe("processMarkup with alternate parseMarkup", function () {
        let oldParseMarkup = null;
        let spyable = null;

        beforeEach(function () {
            spyable = {
                parseIt(markup) {
                    return $.parseHTML(markup);
                },
            };

            oldParseMarkup = sut.parseMarkup;
            const spied = spyOn(spyable, "parseIt").and.callThrough();
            sut.parseMarkup = spied;
        });

        afterEach(function () {
            sut.parseMarkup = oldParseMarkup;
            oldParseMarkup = null;
            spyable = null;
        });

        describe("with single node", function () {
            it("returns dom element", function () {
                const markup = sut.processMarkup("<div>test</div>");

                expect(spyable.parseIt).toHaveBeenCalled();
                expect(markup.nodeType).toBe(1);
                expect(markup.textContent).toBe("test");
                expect(markup.childNodes[0].nodeType).toBe(3);
            });
        });

        describe("with multiple nodes", function () {
            it("returns wrapped dom element", function () {
                const markup = sut.processMarkup("<div>test</div><div>test</div>");

                expect(spyable.parseIt).toHaveBeenCalled();
                expect(markup.className).toBe("durandal-wrapper");
                expect(markup.childNodes.length).toBe(2);
            });
        });

        describe("with comments", function () {
            it("returns dom element with comments removed", function () {
                const markup = sut.processMarkup("<!-- this is a comment --><div>test</div>");

                expect(spyable.parseIt).toHaveBeenCalled();
                expect(markup.nodeType).toBe(1);
                expect(markup.textContent).toBe("test");
                expect(markup.childNodes[0].nodeType).toBe(3);
            });
        });
    });

    describe("createView", function () {
        it("view acquire and data-view attribute added", function () {
            const htmlString = "<div>test</div>";
            const view = sut.createView(htmlString, undefined);
            const hash = sut.hashCode(htmlString);

            expect($(view).data("view")).toBe(hash);
        });
    });
});
