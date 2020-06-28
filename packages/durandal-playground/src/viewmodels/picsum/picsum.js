import ko from "knockout";

import viewTemplate from "./picsum.html";

let exitPromise;

const exitDialogOpen = ko.observable(false);

function PicsumViewModel() {
    this.view = viewTemplate;

    this.images = ko.observableArray([]);

    this.itemModal = {
        title: ko.observable("Details"),
        message: ko.observable("Are you sure you want to leave this page?"),
        buttons: [
            {
                label: "Dismiss",
                action() {
                    // Nothing to do
                },
            },
        ],

        open: ko.observable(false),
    };

    this.exitModal = {
        title: "Navigating away",
        message: "Are you sure you want to leave this page?",
        buttons: [
            {
                label: "Cancel",
                action() {
                    exitPromise(false);
                },
            },
            {
                label: "Yes",
                action() {
                    exitPromise(true);
                },
            },
        ],
        open: exitDialogOpen,
        scrimClickActionBlocked: true,
        escapeKeyActionBlocked: true,
    };

    this.activate = () => {
        if (this.images().length > 0) {
            return true;
        }

        return fetch("https://picsum.photos/v2/list").then(
            async (response) => {
                const imageList = await response.json();
                this.images(imageList);
            },
            (error) => {
                // Could gracefully handle error
            }
        );
    };

    this.select = function select(itemDetails) {
        const Item = itemDetails;
        this.itemModal.title("Details");
        this.itemModal.message(Item.description);
        this.itemModal.open(true);
    }.bind(this);

    // eslint-disable-next-line class-methods-use-this
    this.openExitDialog = async () => {
        let finishNav;
        exitDialogOpen(true);
        const promise = new Promise((resolve) => {
            exitPromise = resolve;
        });
        await promise.then((result) => {
            finishNav = result;
        });
        return finishNav;
    };

    // eslint-disable-next-line class-methods-use-this
    this.canDeactivate = () => {
        return this.openExitDialog();
    };
}

const Picsum = new PicsumViewModel();

export default Picsum;
