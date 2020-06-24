import ko from "knockout";
import { app } from "durandal/core";

import viewTemplate from "./picsum.html";
import itemTemplate from "./detail.html";

class PicsumViewModel {
    constructor() {
        this.view = viewTemplate;

        this.images = ko.observableArray([]);
    }

    activate() {
        if (this.images().length > 0) {
            return true;
        }

        return fetch("https://picsum.photos/v2/list?limit=28").then(
            async (response) => {
                const imageList = await response.json();
                this.images(imageList);
            },
            (error) => {
                // Could gracefully handle error
            }
        );
    }

    // eslint-disable-next-line class-methods-use-this
    select(itemDetails) {
        const Item = itemDetails;
        Item.view = itemTemplate;
        Item.viewName = "Picsum item";
        app.showDialog(Item);
    }

    // eslint-disable-next-line class-methods-use-this
    canDeactivate() {
        // the router's activator calls this function to see if it can leave the screen
        return app.showMessage("Are you sure you want to leave this page?", "Navigate", ["Yes", "No"]);
    }
}

const Picsum = new PicsumViewModel();

export default Picsum;
