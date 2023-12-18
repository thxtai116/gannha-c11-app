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
} from "@angular/material";

import { RecruitersPage } from './recruiters.page';

import { SharedModule } from '../../shared/shared.module';

import { RecruitersState } from './states';
import { RecruitersListPage } from './pages/recruiters-list/recruiters-list.page';
import { RecruitersFormPage } from './pages/recruiters-form/recruiters-form.page';
import { RecruitersDetailPage } from './pages/recruiters-detail/recruiters-detail.page';
import { RecruitersBasicInfoPage } from './pages/recruiters-basic-info/recruiters-basic-info.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        CoreModule,
        LayoutModule,
        PartialsModule,

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

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: "",
                component: RecruitersPage,
                children: [
                    {
                        path: "",
                        component: RecruitersListPage
                    },
                    {
                        path: "create",
                        component: RecruitersFormPage
                    },
                    {
                        path: ':id',
                        component: RecruitersDetailPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'basic-info'
                            },
                            {
                                path: 'basic-info',
                                component: RecruitersBasicInfoPage
                            }
                        ]
                    }
                ]
            }
        ])
    ],
    declarations: [
        RecruitersPage,
        RecruitersListPage,
        RecruitersFormPage,
        RecruitersDetailPage,
        RecruitersBasicInfoPage,
    ],
    entryComponents: [],
    providers: [
        RecruitersState
    ]
})
export class RecruitersModule { }