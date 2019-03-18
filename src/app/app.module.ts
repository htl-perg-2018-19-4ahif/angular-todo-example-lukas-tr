import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  MatCardModule,
  MatButtonModule,
  MatCommonModule,
  MatSelectModule,
  MatDialogModule,
  MatInputModule,
  MatCheckboxModule
} from "@angular/material";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { EditDialogComponent } from "./edit-dialog/edit-dialog.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [AppComponent, EditDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatCommonModule,
    MatSelectModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [EditDialogComponent]
})
export class AppModule {}
