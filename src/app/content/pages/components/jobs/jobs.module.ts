import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { CoreModule } from '../../../../core/core.module';
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { SharedModule } from '../../shared/shared.module';

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
} from "@angular/material";

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MenuService } from './services';

import { JobsState, JobsDetailState } from './states';

import { SubmissionsModule } from '../../../partials/smarts/index';

import { JobsPage } from './jobs.page';

import {
    JobsListPage,
    JobsFormPage,
    JobsDetailPage,
    JobsBasicInfoPage,
    JobsSubmissionsPage,
    JobsUnitsPage,
    JobsReportPage
} from './pages';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        CoreModule,
        LayoutModule,
        PartialsModule,
        SharedModule,
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

        NgxDaterangepickerMd.forRoot(),

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: "",
                component: JobsPage,
                children: [
                    {
                        path: "",
                        component: JobsListPage
                    },
                    {
                        path: "create",
                        component: JobsFormPage
                    },
                    {
                        path: ":id",
                        component: JobsDetailPage,
                        children: [
                            {
                                path: "",
                                redirectTo: "basic-info"
                            },
                            {
                                path: "basic-info",
                                component: JobsBasicInfoPage
                            },
                            {
                                path: "submissions",
                                component: JobsSubmissionsPage
                            },
                            {
                                path: "units",
                                component: JobsUnitsPage
                            },
                            {
                                path: "report",
                                component: JobsReportPage
                            },
                        ]
                    }
                ]
            }
        ])
    ],
    declarations: [
        JobsPage,
        JobsListPage,
        JobsDetailPage,
        JobsBasicInfoPage,
        JobsSubmissionsPage,
        JobsFormPage,
        JobsUnitsPage,
        JobsReportPage
    ],
    providers: [
        MenuService,

        JobsState,
        JobsDetailState
    ]
})
export class JobsModule { }
