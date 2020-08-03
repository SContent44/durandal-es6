import How from "./viewmodels/how/how";

export default [
    {
        route: "",
        title: "How",
        moduleId: function hows() {
            return How;
        },
        modelName: "How",
        nav: true,
    },

    {
        route: "nested",
        title: "Nested async route",
        moduleId: function nested() {
            return import(/* webpackChunkName: "nested-async-route" */ "./viewmodels/nested/nested");
        },
        nav: true,
    },
];
