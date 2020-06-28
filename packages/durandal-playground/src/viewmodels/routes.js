import Welcome from "./welcome/welcome";

export default [
    {
        route: "",
        title: "Welcome",
        moduleId: function Welcomes() {
            return Welcome;
        },
        nav: true,
    },
    {
        route: "picsum",
        title: "Picsum",
        moduleName: "Picsum",
        moduleId: function Picsum() {
            return import(/* webpackChunkName: "flickr-viewmodel" */ "./picsum/picsum");
        },
        nav: true,
    },
    {
        route: "router*details",
        hash: "#router",
        title: "Router",
        moduleName: "Router",
        moduleId: function Router() {
            return import(/* webpackChunkName: "router-viewmodel" */ "./router/index");
        },
        nav: true,
    },
    {
        route: "binding",
        title: "Binding",
        moduleName: "Binding",
        moduleId: function Binding() {
            return import(/* webpackChunkName: "binding-viewmodel" */ "./binding/binding");
        },
        nav: true,
    },
    {
        route: "widgets",
        title: "Widgets",
        moduleName: "Widgets",
        moduleId: function Widgets() {
            return import(/* webpackChunkName: "widgets-viewmodel" */ "./widgets/widgets");
        },
        nav: true,
    },
    {
        route: "components",
        title: "Components",
        moduleName: "Components",
        moduleId: function Components() {
            return import(/* webpackChunkName: "components-viewmodel" */ "./ko-components/ko-components");
        },
        nav: true,
    },
];
