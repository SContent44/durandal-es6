/* eslint-disable eqeqeq */
import $ from "jquery";
import system from "./system";
import viewEngine from "./viewEngine";

/**
 * The viewLocator module collaborates with the viewEngine module to provide views (literally dom sub-trees) to other parts of the framework as needed. The primary consumer of the viewLocator is the composition module.
 * @module viewLocator
 * @requires jquery
 * @requires system
 * @requires viewEngine
 */
function ViewLocatorModule() {
    /**
     * @param {string} view HTML string for the view
     * @return {object} Returns the processed markup to be rendered
     */
    function getView(view, hash) {
        let viewToReturn;
        if (view) {
            viewToReturn = viewEngine.createView(view, hash);
        } else {
            system.error(
                "No view found on the object. Make sure that you a provide view property that has your html template."
            );
        }
        return viewToReturn;
    }

    // eslint-disable-next-line consistent-return
    function findInElements(nodes, hash) {
        for (let i = 0; i < nodes.length; i += 1) {
            const current = nodes[i];
            const existingHash = current.getAttribute("data-view");
            if (existingHash == hash) {
                return current;
            }
        }
    }

    /**
     * @class ViewLocatorModule
     * @static
     */
    return {
        /**
         * Maps an object instance to a view instance.
         * @method locateViewForObject
         * @param {object} obj The object to locate the view for.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateViewForObject(obj, elementsToSearch) {
            let view;

            if (obj.getView) {
                view = obj.getView();
                if (view) {
                    return this.locateView(view, elementsToSearch);
                }
            }

            // Check if view is current "cached" if cacheViews is on
            const hash = viewEngine.hashCode($.trim(obj.view));
            if (hash && elementsToSearch && elementsToSearch.length > 0) {
                const existing = findInElements(elementsToSearch, hash);
                if (existing) {
                    return system
                        .defer((dfd) => {
                            dfd.resolve(existing);
                        })
                        .promise();
                }
            }

            // The new default behaviour
            view = getView(obj.view, hash);
            return this.locateView(view);
        },
        /**
         * Locates the specified view.
         * @method locateView
         * @param {string|DOMElement} viewOrUrlOrId A view, view url or view id to locate.
         * @param {string} [area] The area to translate the view to.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateView(view) {
            if (typeof view === "string") {
                // If we are passed a string see if it is a html string
                if ($.trim(view).charAt(0) === "<") {
                    view = $.trim(view);
                    view = viewEngine.processMarkup(view);
                } else if (viewEngine.isViewUrl(view)) {
                    system.error(
                        "Using a view URL is no longer supported. If you want to directly use a template import it and provide it for composition."
                    );
                } else {
                    system.error(
                        "This is not a HTML string. If you've tried to pass in a view ID it is no longer supported. If you want to directly use a HTML template import it and provide it for composition."
                    );
                }
            }

            return system
                .defer((dfd) => {
                    dfd.resolve(view);
                })
                .promise();
        },
    };
}

export default new ViewLocatorModule();
