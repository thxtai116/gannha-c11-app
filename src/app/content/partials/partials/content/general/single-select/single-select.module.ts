import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { SingleSelectComponent } from './single-select.component';

import { MatFormFieldModule, MatSelectModule } from '@angular/material';

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
        SingleSelectComponent
    ],
    declarations: [
        SingleSelectComponent
    ]
})
export class SingleSelectModule { 
    
}
