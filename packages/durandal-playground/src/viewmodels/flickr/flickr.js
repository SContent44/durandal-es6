import ko from "knockout";
import { app } from "durandal/core";

import viewTemplate from "./flickr.html";
import itemTemplate from "./detail.html";

class FlickrViewModel {
    constructor() {
        this.view = viewTemplate;

        this.images = ko.observableArray([]);
    }

    activate() {
        if (this.images().length > 0) {
            return true;
        }

        return import("durandal/plugins/http").then((http) => {
            return http.default
                .jsonp(
                    "http://api.flickr.com/services/feeds/photos_public.gne",
                    { tags: "mount ranier", tagmode: "any", format: "json" },
                    "jsoncallback"
                )
                .then((response) => {
                    this.images(response.items);
                });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    select(itemDetails) {
        const Item = itemDetails;
        Item.view = itemTemplate;
        Item.viewName = "Flickr item";
        app.showDialog(Item);
    }

    // eslint-disable-next-line class-methods-use-this
    canDeactivate() {
        // the router's activator calls this function to see if it can leave the screen
        //return app.showMessage("Are you sure you want to leave this page?", "Navigate", ["Yes", "No"]);
    }
}

const Flickr = new FlickrViewModel();

export default Flickr;
