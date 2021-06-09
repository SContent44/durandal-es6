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
         * @param {object} obj The object to locate the view for. Must have a view property that holds a string or a getView function that will return a string
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the view.
         */
        locateViewForObject(obj, elementsToSearch) {
            let view;

            if (obj.getView) {
                view = obj.getView();

                return this.locateView(view, elementsToSearch);
            }

            // The new default behaviour
            if (obj.view) {
                return this.locateView(obj.view, elementsToSearch);
            }

            // No view or getView provided
            const personalisedError = `No view provided for view model${obj.modelName ? ` "${obj.modelName}"` : ""}`;
            const noViewMessage = `Durandal.locateViewForObject: ${personalisedError}. Make sure that you a provide a view to your binding directly, as a view property on the model, or as a getView function on the model.`;

            if (system.debug()) {
                system.log(noViewMessage, obj);
                view = viewEngine.createFallbackView();
                return this.locateView(view);
            }

            throw new Error(noViewMessage);
        },
        /**
         * Locates the specified view.
         * @method locateView
         * @param {string|DOMElement} view A view, view url or view id to locate.
         * @param {DOMElement[]} [elementsToSearch] An existing set of elements to search first.
         * @return {Promise} A promise of the rendered view.
         */
        locateView(view, elementsToSearch) {
            return Promise.resolve(view).then((resolvedView) => {
                if (typeof resolvedView === "string") {
                    const hash = viewEngine.hashCode(resolvedView);

                    if (elementsToSearch && elementsToSearch.length > 0) {
                        // If using cacheViews functionality
                        const existing = findInElements(elementsToSearch, hash);
                        if (existing) {
                            resolvedView = existing;
                        } else {
                            resolvedView = viewEngine.createView(resolvedView, hash);
                        }
                    } else {
                        resolvedView = viewEngine.createView(resolvedView, hash);
                    }
                }

                return resolvedView;
            });
        },
    };
}

export default ViewLocatorModule();
