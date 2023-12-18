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
    MatAutocompleteModule,
    MatCardModule,
    MatDividerModule,
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { LayoutModule } from '../../../../../layout/layout.module';
import { PortletModule } from '../portlet/portlet.module';

import { JobEmbryoComponent } from './job-embryo.component';
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
        MatAutocompleteModule,
        MatCardModule,
        MatDividerModule,

        LayoutModule,
        PortletModule,
        
        TranslateModule.forChild()
    ],
    declarations: [
        JobEmbryoComponent,
    ],
    exports: [
        JobEmbryoComponent,
    ],
})
export class JobEmbryoModule { }
