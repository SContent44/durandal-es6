import { router } from "durandal/plugins";
import viewTemplate from "./index.html";
import fadeIn from "durandal/transitions/fadeIn";

import routes from "./routes";

const Index = {
    view: viewTemplate,
    transition: fadeIn,
};

Index.router = router.createChildRouter().makeRelative({ fromParent: true }).map(routes).buildNavigationModel();

export default Index;
