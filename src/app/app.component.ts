import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material";
import { EditDialogComponent } from "./edit-dialog/edit-dialog.component";

export interface IToDo {
  id?: number;
  description: string;
  assignedTo?: string;
  done?: boolean;
}

export interface IPerson {
  name: string;
}

enum DoneFilter {
  all = "all",
  done = "done",
  ongoing = "ongoing"
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  todos: IToDo[] = [];
  people: IPerson[] = [];
  doneFilter = DoneFilter.all;
  personFilter: string | undefined;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  /**
   * Creates or updates a todo
   * @param existingTodo Creates a new todo if none is passed
   */
  openDialog(existingTodo?: IToDo): void {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: "250px",
      data: {
        todo: {
          ...existingTodo
        },
        people: this.people
      }
    });

    dialogRef
      .afterClosed()
      .subscribe(({ todo }: { todo: IToDo }) =>
        existingTodo ? this.updateTodo(todo) : this.createTodo(todo)
      );
  }

  matchesDoneFilter(todo: IToDo) {
    return (
      this.doneFilter === DoneFilter.all ||
      (todo.done === true && this.doneFilter === DoneFilter.done) ||
      (!todo.done && this.doneFilter === DoneFilter.ongoing)
    );
  }

  matchesPersonFilter(todo: IToDo) {
    return !this.personFilter || todo.assignedTo === this.personFilter;
  }

  get filteredTodos() {
    return this.todos.filter(
      t => this.matchesDoneFilter(t) && this.matchesPersonFilter(t)
    );
  }

  ngOnInit(): void {
    this.fetchPeople();
    this.fetchTodos();
  }

  fetchTodos() {
    this.http.get<IToDo[]>("http://localhost:8080/api/todos").subscribe(
      todos => {
        this.todos = todos;
      },
      error => {
        this.http.get<IToDo[]>("http://localhost:3010/api/todos").subscribe(
          todos => {
            this.todos = todos;
          },
          error2 => {
            alert(error.message || error);
          }
        );
      }
    );
  }

  fetchPeople() {
    this.http.get<IPerson[]>("http://localhost:8080/api/people").subscribe(
      people => {
        this.people = people;
      },
      error => {
        this.http.get<IPerson[]>("http://localhost:3010/api/people").subscribe(
          people => {
            this.people = people;
          },
          error2 => {
            alert(error.message || error);
          }
        );
      }
    );
  }

  createTodo(todo: IToDo) {
    this.http.post<IToDo>("http://localhost:8080/api/todos", todo).subscribe(
      newTodo => {
        this.todos.push(newTodo);
      },
      error => {
        this.http
          .post<IToDo>("http://localhost:3010/api/todos", todo)
          .subscribe(
            newTodo => {
              this.todos.push(newTodo);
            },
            error2 => {
              alert(error.message || error);
            }
          );
      }
    );
  }

  updateTodo(todo: IToDo) {
    this.http
      .patch<IToDo>(`http://localhost:8080/api/todos/${todo.id}`, todo)
      .subscribe(
        newTodo => {
          this.todos = this.todos.map(t => (t.id === todo.id ? newTodo : t));
        },
        error => {
          this.http
            .patch<IToDo>(`http://localhost:3010/api/todos/${todo.id}`, todo)
            .subscribe(
              newTodo => {
                this.todos = this.todos.map(t =>
                  t.id === todo.id ? newTodo : t
                );
              },
              error2 => {
                alert(error.message || error);
              }
            );
        }
      );
  }

  deleteTodo(todo: IToDo) {
    this.http.delete(`http://localhost:8080/api/todos/${todo.id}`).subscribe(
      () => {
        this.todos = this.todos.filter(t => t.id !== todo.id);
      },
      error => {
        this.http
          .delete(`http://localhost:3010/api/todos/${todo.id}`)
          .subscribe(
            () => {
              this.todos = this.todos.filter(t => t.id !== todo.id);
            },
            error2 => {
              alert(error.message || error);
            }
          );
      }
    );
  }
}
