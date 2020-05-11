import $ from "jquery";
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
    const allPluginIds = [];
    const allPluginConfigs = [];

    function loadPlugins() {
        return system
            .defer((dfd) => {
                if (allPluginIds.length === 0) {
                    dfd.resolve();
                    return;
                }

                const pluginsToInstall = [];

                for (let i = 0; i < allPluginIds.length; i += 1) {
                    const pluginPromise = system.acquire(allPluginIds[i]).then((loaded) => {
                        const module = system.resolveObject(loaded);

                        if (module.install) {
                            let config = allPluginConfigs[i];
                            if (!system.isObject(config)) {
                                config = {};
                            }

                            module.install(config);
                            system.log(`Plugin:Installed ${allPluginIds[i].name}`);
                        } else {
                            system.log(`Plugin:Loaded ${allPluginIds[i].name}`);
                        }
                    });
                    pluginsToInstall.push(pluginPromise);
                }

                Promise.all(pluginsToInstall).then(
                    () => {
                        dfd.resolve();
                    },
                    (err) => {
                        system.error(`Failed to load plugin(s). Details: ${err.message}`);
                    }
                );
            })
            .promise();
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
        configurePlugins(config) {
            const pluginIds = system.keys(config);

            for (let i = 0; i < pluginIds.length; i += 1) {
                const key = pluginIds[i];
                let plugin;
                switch (key) {
                    case "router":
                        plugin = function router() {
                            return import("../plugins/router");
                        };
                        break;
                    case "widget":
                        plugin = function widget() {
                            return import("../plugins/widget");
                        };
                        break;
                    case "dialog":
                        plugin = function dialog() {
                            return import("../plugins/dialog");
                        };
                        break;
                    case "history":
                        plugin = function history() {
                            return import("../plugins/history");
                        };
                        break;
                    case "http":
                        plugin = function http() {
                            return import("../plugins/http");
                        };
                        break;
                    case "observable":
                        plugin = function observable() {
                            return import("../plugins/observable");
                        };
                        break;
                    case "serializer":
                        plugin = function serializer() {
                            return import("../plugins/serializer");
                        };
                        break;
                    default:
                        plugin = function notDefined() {
                            return undefined;
                        };
                        system.error(
                            `The plugin ${key} is not in the list of registered plugins. Update the app.configurePlugins to include this plugin.`
                        );
                }

                allPluginIds.push(plugin);
                allPluginConfigs.push(config[key]);
            }
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

            return system
                .defer((dfd) => {
                    $(() => {
                        loadPlugins().then(() => {
                            dfd.resolve();
                            system.log("Application:Started");
                        });
                    });
                })
                .promise();
        },
        /**
         * Sets the root module/view for the application.
         * @method setRoot
         * @param {string} root The root view or module.
         * @param {string} [transition] The transition to use from the previous root (or splash screen) into the new root.
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
                if ($.trim(root).charAt(0) === "<") {
                    settings.view = root;
                } else {
                    system.error(
                        "Does not supppot passing in a string other than a HTML string to render for the page. If you want to pass in a view model directly pass it in as a model property on the object"
                    );
                }
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
                                    .fail((err) => {
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

            // TODO: look at this
            if (system.isString(settings.model)) {
                system
                    .acquire(settings.model)
                    .then((module) => {
                        settings.model = system.resolveObject(module);
                        finishComposition();
                    })
                    .fail((err) => {
                        system.error(`Failed to load root module (${settings.model}). Details: ${err.message}`);
                    });
            } else {
                finishComposition();
            }
        },
    };

    Events.includeIn(app);

    return app;
}

export default new AppModule();
