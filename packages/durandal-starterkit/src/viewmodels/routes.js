import Welcome from "./welcome/welcome";

export default [
    {
        route: "",
        title: "Welcome",
        moduleName: "Welcome",
        moduleId: () => {
            return Welcome;
        },
        nav: true,
    },
    {
        route: "flickr",
        title: "Flickr",
        moduleName: "Flickr",
        moduleId: () => {
            return import(/* webpackChunkName: "flickr-viewmodel" */ "./flickr/flickr");
        },
        nav: true,
    },
    {
        route: "router*details",
        hash: "#router",
        title: "Router",
        moduleName: "Router",
        moduleId: () => {
            return import(/* webpackChunkName: "router-viewmodel" */ "./router/index");
        },
        nav: true,
    },
    {
        route: "binding",
        title: "Binding",
        moduleName: "Binding",
        moduleId: () => {
            return import(/* webpackChunkName: "binding-viewmodel" */ "./binding/binding");
        },
        nav: true,
    },
    {
        route: "widgets",
        title: "Widgets",
        moduleName: "Widgets",
        moduleId: () => {
            return import(/* webpackChunkName: "widgets-viewmodel" */ "./widgets/widgets");
        },
        nav: true,
    },
    {
        route: "components",
        title: "Components",
        moduleName: "Components",
        moduleId: () => {
            return import(/* webpackChunkName: "components-viewmodel" */ "./ko-components/ko-components");
        },
        nav: true,
    },
];
