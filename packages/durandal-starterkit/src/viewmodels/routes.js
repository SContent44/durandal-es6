import Welcome from "./welcome/welcome";

export default [
    {
        route: "",
        title: "Welcome",
        moduleId() {
            return Welcome;
        },
        nav: true,
    },
    {
        route: "picsum",
        title: "Picsum",
        moduleId() {
            return import(/* webpackChunkName: "picsum-viewmodel" */ "./picsum/picsum");
        },
        nav: true,
    },
    {
        route: "router*details",
        hash: "#router",
        title: "Router",
        moduleId() {
            return import(/* webpackChunkName: "router-viewmodel" */ "./router/index");
        },
        nav: true,
    },
    {
        route: "binding",
        title: "Binding",
        moduleId() {
            return import(/* webpackChunkName: "binding-viewmodel" */ "./binding/binding");
        },
        nav: true,
    },
    {
        route: "widgets",
        title: "Widgets",
        moduleId() {
            return import(/* webpackChunkName: "widgets-viewmodel" */ "./widgets/widgets");
        },
        nav: true,
    },
    {
        route: "components",
        title: "Components",
        moduleId() {
            return import(/* webpackChunkName: "components-viewmodel" */ "./ko-components/ko-components");
        },
        nav: true,
    },
];
