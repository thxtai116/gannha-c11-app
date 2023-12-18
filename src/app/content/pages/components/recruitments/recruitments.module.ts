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
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
} from "@angular/material";

import { RecruitmentsState, RecruitmentsDetailState } from './states';

import { MenuService } from './services';

import { SharedModule } from '../../shared/shared.module';

import { RecruitmentsPage } from './recruitments.page';

import {
    RecruitmentsListPage,
    RecruitmentsDetailPage,
    RecruitmentsBasicInfoPage,
    JobsListPage,
    SubmissionsListPage,
    RecruitmentReportPage
} from './pages';

import { SubmissionsModule } from '../../../partials/smarts/index';

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
        MatSortModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatChipsModule,
        MatDialogModule,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: "",
                component: RecruitmentsPage,
                children: [
                    {
                        path: "",
                        component: RecruitmentsListPage
                    },
                    {
                        path: ":id",
                        component: RecruitmentsDetailPage,
                        children: [
                            {
                                path: "",
                                redirectTo: "basic-info"
                            },
                            {
                                path: "basic-info",
                                component: RecruitmentsBasicInfoPage
                            },
                            {
                                path: "jobs",
                                component: JobsListPage
                            },
                            {
                                path: "submissions",
                                component: SubmissionsListPage
                            },
                            {
                                path: "report",
                                component: RecruitmentReportPage
                            }
                        ]
                    }
                ]
            }
        ])
    ],
    declarations: [
        RecruitmentsPage,
        RecruitmentsListPage,
        RecruitmentsDetailPage,
        RecruitmentsBasicInfoPage,

        JobsListPage,
        SubmissionsListPage,

        RecruitmentReportPage,
    ],
    providers: [
        RecruitmentsState,
        RecruitmentsDetailState,

        MenuService
    ]
})
export class RecruitmentsModule { }
