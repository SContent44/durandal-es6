import router from "durandal/plugins/router";
import viewTemplate from "./index.html";

import routes from "./routes";

const Index = {
    view: viewTemplate,
};

Index.router = router.createChildRouter().makeRelative({ fromParent: true }).map(routes).buildNavigationModel();

export default Index;
