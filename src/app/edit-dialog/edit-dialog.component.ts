import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { IToDo, IPerson } from "../app.component";

@Component({
  selector: "app-edit-dialog",
  templateUrl: "./edit-dialog.component.html",
  styleUrls: ["./edit-dialog.component.sass"]
})
export class EditDialogComponent implements OnInit {
  ngOnInit() {}

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { todo: IToDo; people: IPerson[] }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
