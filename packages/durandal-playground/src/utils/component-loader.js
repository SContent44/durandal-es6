/* eslint-disable no-underscore-dangle */
import ko from "knockout";

// eslint-disable-next-line import/prefer-default-export
export class WebpackComponentLoader {
    /**
     * @param context require.context() return value
     */
    constructor(context) {
        this.manifest = new Map();

        context
            .keys()
            .map((k) => ({
                path: k,
                name: k.match(/[\\/]([^\\/]+)/)[1],
            }))
            .forEach(({ name, path }) => {
                // see http://knockoutjs.com/documentation/component-custom-elements.html#registering-custom-elements
                ko.components.register(name, {});

                this.manifest.set(name, () => context(path));
            });
    }

    // eslint-disable-next-line consistent-return
    getConfig(name, cb) {
        if (!this.manifest.has(name)) {
            return cb(null);
        }
        this.manifest
            .get(name)()
            .then((module) => {
                // Check if this is a es6 module default export
                const config =
                    module && typeof module === "object" && module.__esModule && module.default
                        ? module.default
                        : module;

                cb({ ...config, synchronous: false });
            });
    }
}
