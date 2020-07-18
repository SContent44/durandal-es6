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
                if (system.isString(obj.view) && view.trim().charAt(0) === "<") {
                    return this.locateView(view, elementsToSearch);
                }

                system.log("View must be a HTML string for it to work with the view caching functionality");
                return this.locateView(view, elementsToSearch);
            }

            // The new default behaviour
            // Check if view is current "cached" if cacheViews is on
            if (!!obj.view && system.isString(obj.view)) {
                return this.locateView(obj.view, elementsToSearch);
            }

            // No view or getView provided
            const noViewMessage =
                "WARNING: No view found provided. Make sure that you a provide a view via a view property on the viewmodel (or via your custom getView function)";
            if (system.debug()) {
                system.log(noViewMessage);
                view = viewEngine.createFallbackView();
                return this.locateView(view);
            }

            system.error(noViewMessage);
        },
        /**
         * Locates the specified view.
         * @method locateView
         * @param {string|DOMElement} viewOrUrlOrId A view, view url or view id to locate.
         * @param {string} [area] The area to translate the view to.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateView(view, elementsToSearch) {
            if (typeof view === "string") {
                view = view.trim();

                if (view.charAt(0) === "<") {
                    const hash = viewEngine.hashCode(view);
                    if (elementsToSearch && elementsToSearch.length > 0) {
                        // If using cacheViews functionality
                        const existing = findInElements(elementsToSearch, hash);
                        if (existing) {
                            view = existing;
                        } else {
                            view = viewEngine.createView(view, hash);
                        }
                    } else {
                        view = viewEngine.createView(view, hash);
                    }
                } else {
                    system.error(
                        "This is not a HTML string. If you've tried to pass in a view ID it is no longer supported. If you want to directly use a HTML template import it and provide it for composition."
                    );
                }
            }

            return Promise.resolve(view);
        },
    };
}

export default new ViewLocatorModule();
