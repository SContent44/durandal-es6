import system from "./system";
import composition from "./composition";
import Events from "./events";

/**
 * The app module controls app startup, plugin loading/configuration and root visual display.
 * @module app
 * @requires jquery
 * @requires system
 * @requires viewEngine
 * @requires composition
 * @requires events
 */
function AppModule() {
    const pluginManifest = [];

    function documentReady(fn) {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function loadPlugins() {
        if (pluginManifest.length === 0) {
            return;
        }

        const pluginsToInstall = [];

        pluginManifest.forEach((pluginToLoad) => {
            pluginsToInstall.push(
                system.acquire(pluginToLoad.module).then((pluginModule) => {
                    const plugin = system.resolveObject(pluginModule);

                    if (plugin.install) {
                        let { config } = pluginToLoad;
                        if (!system.isObject(config)) {
                            config = {};
                        }

                        plugin.install(config);
                        system.log(`Plugin:Installed ${pluginToLoad.module.name}`);
                    } else {
                        system.log(`Plugin:Loaded ${pluginToLoad.module.name}`);
                    }
                })
            );
        });

        return Promise.all(pluginsToInstall).then(
            (resolve) => {
                system.log("All plugins loaded.");
            },
            (error) => {
                system.error(`Failed to load plugin(s). Details: ${error.message}`);
            }
        );
    }

    /**
     * @class AppModule
     * @static
     * @uses Events
     */
    const app = {
        /**
         * The title of your application.
         * @property {string} title
         */
        title: "Application",
        /**
         * Configures one or more plugins to be loaded and installed into the application.
         * @method configurePlugins
         * @param {object} config Keys are plugin names. Values can be truthy, to simply install the plugin, or a configuration object to pass to the plugin.
         */
        configurePlugins(configCollection) {
            configCollection.forEach((config) => {
                if (config.module) {
                    pluginManifest.push(config);
                } else {
                    throw new Error("Plugin config missing pluginModule.");
                }
            });
        },
        /**
         * Starts the application.
         * @method start
         * @return {promise}
         */
        start() {
            system.log("Application:Starting");

            if (this.title) {
                document.title = this.title;
            }

            return Promise.resolve(
                documentReady(() => {
                    loadPlugins().then(() => {
                        system.log("Application:Started");
                    });
                })
            );
        },
        /**
         * Sets the root module/view for the application.
         * @method setRoot
         * @param {string} root The root view or module.
         * @param {string|function} [transition] The transition to use from the previous root (or splash screen) into the new root. Can be a string for a pre-registered transition such as 'fadeIn' or it can be a function that returns a transition
         * @param {string} [applicationHost] The application host element or id. By default the id 'applicationHost' will be used.
         */
        setRoot(root, transition, applicationHost) {
            let hostElement;
            const settings = { activate: true, transition };

            if (!applicationHost || system.isString(applicationHost)) {
                hostElement = document.getElementById(applicationHost || "applicationHost");
            } else {
                hostElement = applicationHost;
            }

            if (system.isString(root)) {
                settings.view = root;
            } else {
                settings.model = root;
            }

            function finishComposition() {
                if (settings.model) {
                    if (settings.model.canActivate) {
                        try {
                            const result = settings.model.canActivate();
                            if (result && result.then) {
                                result
                                    .then((actualResult) => {
                                        if (actualResult) {
                                            composition.compose(hostElement, settings);
                                        }
                                    })
                                    .catch((err) => {
                                        system.error(err);
                                    });
                            } else if (result) {
                                composition.compose(hostElement, settings);
                            }
                        } catch (er) {
                            system.error(er);
                        }
                    } else {
                        composition.compose(hostElement, settings);
                    }
                } else {
                    composition.compose(hostElement, settings);
                }
            }

            finishComposition();
        },
    };

    Events.includeIn(app);

    return app;
}

export default AppModule();
