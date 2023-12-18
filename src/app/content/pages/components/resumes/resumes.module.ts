import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '../../../../core/core.module';
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import {
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
} from "@angular/material";

import { ResumesState } from './states';

import { SharedModule } from '../../shared/shared.module';

import { SubmissionsModule } from '../../../partials/smarts';

import { ResumesPage } from './resumes.page';
import { ResumesListPage } from './pages/resumes-list/resumes-list.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        SharedModule,
        CoreModule,
        LayoutModule,
        PartialsModule,
        SubmissionsModule,

        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatPaginatorModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatTooltipModule,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: "",
                component: ResumesPage,
                children: [
                    {
                        path: "",
                        component: ResumesListPage
                    }

                ]
            }
        ])
    ],
    exports: [],
    declarations: [
        ResumesPage,
        ResumesListPage,
    ],
    providers: [
        ResumesState
    ]
})
export class ResumesModule { }