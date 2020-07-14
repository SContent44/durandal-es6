import { router } from "durandal/plugins";
import viewTemplate from "./index.html";

import routes from "./routes";

const Index = {
    view: viewTemplate,
    moduleName: "Router VM index",
};

Index.activate = () => {
    if (!Index.router) {
        Index.router = router.createChildRouter().makeRelative({ fromParent: true }).map(routes).buildNavigationModel();
    }
};

export default Index;
