import $ from "jquery";
import system from "./system";

/**
 * The viewEngine module provides information to the viewLocator module which is used to locate the view's source file. The viewEngine also transforms a view id into a view instance.
 * @module viewEngine
 * @requires jquery
 */
function ViewEngineModule() {
    let parseMarkup;

    if ($.parseHTML) {
        parseMarkup = function (html) {
            return $.parseHTML(html);
        };
    } else {
        parseMarkup = function (html) {
            return $(html).get();
        };
    }

    /**
     * @class ViewEngineModule
     * @static
     */
    return {
        /**
         * The cache of the hashed representation of a view string matching it's rendered HTML
         * @property {object} cache for storing the cached rendered HTML
         */
        cache: {},
        /**
         * The file extension that view source files are expected to have.
         * @property {string} viewExtension
         * @default .html
         */
        viewExtension: ".html",
        /**
         * Determines if the url is a url for a view, according to the view engine.
         * @method isViewUrl
         * @param {string} url The potential view url.
         * @return {boolean} True if the url is a view url, false otherwise.
         */
        isViewUrl(url) {
            return url.indexOf(this.viewExtension, url.length - this.viewExtension.length) !== -1;
        },
        /**
         * Parses the view engine recognized markup and returns DOM elements.
         * @method parseMarkup
         * @param {string} markup The markup to parse.
         * @return {DOMElement[]} The elements.
         */
        parseMarkup,
        /**
         * Calls `parseMarkup` and then pipes the results through `ensureSingleElement`.
         * @method processMarkup
         * @param {string} markup The markup to process.
         * @return {DOMElement} The view.
         */
        processMarkup(markup) {
            const allElements = this.parseMarkup(markup);
            return this.ensureSingleElement(allElements);
        },
        /**
         * Converts an array of elements into a single element. White space and comments are removed. If a single element does not remain, then the elements are wrapped.
         * @method ensureSingleElement
         * @param {DOMElement[]} allElements The elements.
         * @return {DOMElement} A single element.
         */
        ensureSingleElement(allElements) {
            if (!allElements) {
                // eslint-disable-next-line no-unused-expressions
                $("<div></div>")[0];
            } else if (allElements.length === 1) {
                return allElements[0];
            }

            const withoutCommentsOrEmptyText = [];

            for (let i = 0; i < allElements.length; i += 1) {
                const current = allElements[i];
                if (current.nodeType !== 8) {
                    if (current.nodeType === 3) {
                        const result = /\S/.test(current.nodeValue);
                        if (!result) {
                            continue;
                        }
                    }

                    withoutCommentsOrEmptyText.push(current);
                }
            }

            if (withoutCommentsOrEmptyText.length > 1) {
                return $(withoutCommentsOrEmptyText).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0);
            }

            return withoutCommentsOrEmptyText[0];
        },
        /**
         * Gets the view associated with the HTML template from the cache of parsed views.
         * @method tryGetViewFromCache
         * @param {string} id The view id to lookup in the cache.
         * @return {DOMElement|null} The cached view or null if it's not in the cache.
         */
        tryGetViewFromCache(id) {
            return this.cache[id];
        },
        /**
         * Puts the view associated with the HTML template into the cache of parsed views.
         * @method putViewInCache
         * @param {string} id The view id whose view should be cached.
         * @param {DOMElement} view The view to cache.
         */
        putViewInCache(id, view) {
            this.cache[id] = view;
        },
        /**
         * Used to generate a hash based on the passed in string to be used as the id when storing cached views for createView
         * @param {string} s the string that will be hashed
         * @return {string} The hashed representation of the input string
         */
        hashCode(s) {
            let hash = 0;
            let i;
            let char;
            let l;
            if (s.length === 0) {
                return hash;
            }

            for (i = 0, l = s.length; i < l; i += 1) {
                char = s.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        /**
         * Creates the view based on the view string.
         * @method createView
         * @param {string} htmlString The HTML string for the view to be rendered.
         * @param {string} hash Hash of the html string to see if it can be reused from the cache
         * @return {object} The processed HTML
         */
        createView(htmlString, hash) {
            const view = htmlString.trim();

            if (view.charAt(0) === "<") {
                const cacheId = hash || this.hashCode(view);

                const existing = this.tryGetViewFromCache(cacheId);

                let element;
                if (existing) {
                    element = existing.cloneNode(true);
                } else {
                    element = this.processMarkup(view);
                    element.setAttribute("data-view", cacheId);
                    this.putViewInCache(cacheId, element);
                }

                return element.cloneNode(true);
            }

            throw new Error(
                "A non HTML string was passed to durandal-es6 viewEngine.createView. Ensure not using original Durandal Require.js behaviour"
            );
        },
        /**
         * Called when a view cannot be found to provide the opportunity to locate or generate a fallback view. Mainly used to ease development.
         * @method createFallbackView
         * @param {string} htmlString The HTML string to be rendered if not wishing to use the default durandal-view-404
         * @return {object} The processed HTML
         */
        createFallbackView(htmlString = `<div class="durandal-view-404">View Not Found.</div>`) {
            return this.createView(htmlString, undefined);
        },
    };
}

export default ViewEngineModule();
