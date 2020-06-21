import ko from "knockout";

// represent a single todo item
function Todo(title, completed) {
    this.title = ko.observable(title);
    this.completed = ko.observable(completed);
    this.editing = ko.observable(false);
}

export default Todo;
