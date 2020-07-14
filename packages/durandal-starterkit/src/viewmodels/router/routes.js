import How from "./viewmodels/how/how";

export default [
    {
        route: "",
        title: "How",
        moduleId: How,
        nav: true,
    },
    {
        route: "nested",
        title: "Nested async route",
        moduleId: import(/* webpackChunkName: "nested-async-route" */ "./viewmodels/nested/nested"),
        nav: true,
    },
];
