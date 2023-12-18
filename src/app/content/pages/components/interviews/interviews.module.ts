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
import { InterviewsPage } from './interviews.page';
import { InterviewsListPage } from './pages';
import { InterviewsState } from './states';
import { InterviewLocationComponent } from './components/interview-location/interview-location.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        CoreModule,
        LayoutModule,
        PartialsModule,
        SharedModule,

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
                component: InterviewsPage,
                children: [
                    {
                        path: "",
                        component: InterviewsListPage
                    },
                    // {
                    //     path: "create",
                    //     component: JobsFormPage
                    // },
                    // {
                    //     path: ":id",
                    //     component: JobsDetailPage,
                    //     children: [
                    //         {
                    //             path: "",
                    //             redirectTo: "basic-info"
                    //         },
                    //         {
                    //             path: "basic-info",
                    //             component: JobsBasicInfoPage
                    //         },
                    //         {
                    //             path: "submissions",
                    //             component: JobsSubmissionsPage
                    //         },
                    //         {
                    //             path: "units",
                    //             component: JobsUnitsPage
                    //         },
                    //         {
                    //             path: "report",
                    //             component: JobsReportPage
                    //         },
                    //     ]
                    // }
                ]
            }
        ])
    ],
    declarations: [
        InterviewsPage,
        InterviewsListPage,
        InterviewLocationComponent,
    ],
    providers: [
        InterviewsState
    ],
    entryComponents: [
        InterviewLocationComponent
    ]
})
export class InterviewsModule { }
