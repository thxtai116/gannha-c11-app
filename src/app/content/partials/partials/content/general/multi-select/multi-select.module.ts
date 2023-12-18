import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { MultiSelectComponent } from './multi-select.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatSelectModule,

        NgxMatSelectSearchModule
    ],
    exports: [
        MultiSelectComponent
    ],
    declarations: [
        MultiSelectComponent
    ]
})
export class MultiSelectModule { }
