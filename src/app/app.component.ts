import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material";
import { EditDialogComponent } from "./edit-dialog/edit-dialog.component";
import { retry, take, concatMap } from "rxjs/operators";
import { range, Observable } from "rxjs";

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
  /** URLs that we want to try one after the other */
  private static readonly baseUrls = [
    "http://localhost:8080/api",
    "http://localhost:8080/api"
  ];

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

  private executeWithUrlFallback<T>(httpCall: (baseUrl: string) => Observable<T>): Observable<T> {
    // Index in AppComponent.baseUrls referencing the current URL to try
    let baseUrlIx = 0;

    // Range returns an observable with one element per entry in AppComponent.baseUrls
    return range(0, AppComponent.baseUrls.length).pipe(
      concatMap(_ =>
        // Try current URL and increment index after trying
        httpCall(AppComponent.baseUrls[baseUrlIx++])),
      // Retry as long as we have additional URLs
      retry(AppComponent.baseUrls.length - 1),
      // Stop after first successfull API call
      take(1)
    );
  }

  fetchTodos() {
    this.executeWithUrlFallback(baseUrl => this.http.get<IToDo[]>(`${baseUrl}/todos`))
    // Note that we could get rid of subscribe by using Angular's async pipe
    .subscribe(
      todos => this.todos = todos,
      error => alert(error.message || error)
    );
  }

  fetchPeople() {
    this.executeWithUrlFallback(baseUrl => this.http.get<IPerson[]>(`${baseUrl}/people`))
    .subscribe(
      people => this.people = people,
      error => alert(error.message || error)
    );
  }

  createTodo(todo: IToDo) {
    this.executeWithUrlFallback(baseUrl => this.http.post<IToDo>(`${baseUrl}/todos`, todo))
    .subscribe(
      newTodo => this.todos.push(newTodo),
      error => alert(error.message || error)
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
              () => {
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
            () => {
              alert(error.message || error);
            }
          );
      }
    );
  }
}
