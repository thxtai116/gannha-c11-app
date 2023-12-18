import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TagsComponent } from './tags.component';
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatTooltipModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatAutocompleteModule
    ],
    declarations: [
        TagsComponent
    ],
    exports: [
        TagsComponent
    ],
})
export class TagsModule { }
