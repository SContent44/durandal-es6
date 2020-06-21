import ko from "knockout";
import g from "./config/global";
import Todo from "./models/Todo";
import "./extends/handlers";
import viewTemplate from "./material-todo.html";

function TodoViewModel() {
    this.view = viewTemplate;
    this.viewName = "Todo";

    this.todos = ko.observableArray([]);

    // store the new todo value being entered
    this.current = ko.observable();

    // add a new todo, when enter key is pressed
    this.add = () => {
        const current = this.current().trim();

        if (current) {
            this.todos.push(new Todo(current));
            this.current("");
        }
    };

    // remove a single todo
    this.remove = function (todo) {
        this.todos.remove(todo);
    }.bind(this);

    // remove all completed todos
    this.removeCompleted = () => {
        this.todos.remove((todo) => {
            return todo.completed();
        });
    };

    // edit an item
    this.editItem = (item) => {
        item.editing(true);
        item.previousTitle = item.title();
    };

    // stop editing an item.  Remove the item, if it is now empty
    this.stopEditing = (item) => {
        item.editing(false);

        const title = item.title();
        const trimmedTitle = title.trim();

        // Observable value changes are not triggered if they're consisting of whitespaces only
        // Therefore, compare untrimmed version with a trimmed one to check whether anything changed
        // And if yes, we've to set the new value manually
        if (title !== trimmedTitle) {
            item.title(trimmedTitle);
        }

        if (!trimmedTitle) {
            this.remove(item);
        }
    };

    // cancel editing an item and revert to the previous content
    this.cancelEditing = (item) => {
        item.editing(false);
        item.title(item.previousTitle);
    };

    // count of all completed todos
    this.completedCount = ko.pureComputed(() => {
        return ko.utils.arrayFilter(this.todos(), (todo) => {
            return todo.completed();
        }).length;
    });

    // count of todos that are not complete
    this.remainingCount = ko.pureComputed(() => {
        return this.todos().length - this.completedCount();
    });

    // writeable computed observable to handle marking all complete/incomplete
    this.allCompleted = ko.computed(
        {
            // always return true/false based on the done flag of all todos
            read() {
                return this.todos().length > 0 && !this.remainingCount();
            },
            // set all todos to the written value (true/false)
            write(newValue) {
                ko.utils.arrayForEach(this.todos(), (todo) => {
                    // set even if value is the same, as subscribers are not notified in that case
                    todo.completed(newValue);
                });
            },
        },
        this
    );

    // helper function to keep expressions out of markup
    this.getLabel = (count) => {
        return ko.utils.unwrapObservable(count) === 1 ? "item" : "items";
    };

    // internal computed observable that fires whenever anything changes in our todos
    ko.computed(() => {
        // store a clean copy to local storage, which also creates a dependency
        // on the observableArray and all observables in each item
        window.localStorage.setItem(g.localStorageItem, ko.toJSON(this.todos));
    }).extend({
        rateLimit: { timeout: 500, method: "notifyWhenChangesStop" },
    }); // save at most twice per second
}

const TodoVM = new TodoViewModel();

export default TodoVM;
