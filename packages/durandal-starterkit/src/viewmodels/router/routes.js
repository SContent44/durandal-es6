import How from "./viewmodels/how/how";

export default [
    {
        route: "",
        title: "How",
        moduleId: () => {
            return How;
        },
        moduleName: "How",
        nav: true,
    },

    {
        route: "nested",
        title: "Nested async route",
        moduleId: function Nested() {
            return import(/* webpackChunkName: "nested-async-route" */ "./viewmodels/nested/nested");
        },
        nav: true,
    },
];
