import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
    MatExpansionModule,
    MatRadioModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';
import { FilesModule } from '../../../partials/smarts/files/files.module';

import { BrandPage } from './brand.page';
import { BrandBasicInfoPage } from './pages/brand-basic-info/brand-basic-info.page';
import { BrandDefaultSellingPointPage } from './pages/brand-default-selling-point/brand-default-selling-point.page';
import { BrandReportPage } from './pages/brand-report/brand-report.page';
import { BrandOverviewPage } from './pages/brand-overview/brand-overview.page';

import { BrandState } from './states';
import { MenuService } from './services/index';
import { MainBrandReportPage } from './pages/main-brand-report/main-brand-report.page';
import { UnitBrandReportPage } from './pages/unit-brand-report/unit-brand-report.page';
import { SellingPointBrandReportPage } from './pages/selling-point-brand-report/selling-point-brand-report.page';

import { BrandReportState } from './states/brand-report.state';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        CoreModule,
        LayoutModule,
        PartialsModule,
        SharedModule,
        FilesModule,

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
        MatExpansionModule,
        MatRadioModule,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: '',
                component: BrandPage,
                children: [
                    {
                        path: "",
                        redirectTo: "basic-info"
                    },
                    {
                        path: "basic-info",
                        component: BrandBasicInfoPage
                    },
                    {
                        path: "default-selling-point",
                        component: BrandDefaultSellingPointPage
                    },
                    {
                        path: "report",
                        component: BrandReportPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'main-report'
                            },
                            {
                                path: 'main-report',
                                component: MainBrandReportPage
                            },
                            {
                                path: 'unit-report',
                                component: UnitBrandReportPage
                            },
                            {
                                path: 'sp-report',
                                component: SellingPointBrandReportPage
                            }
                        ]
                    }
                ]
            }
        ])
    ],
    providers: [
        BrandState,
        MenuService,
        BrandReportState,
    ],
    declarations: [
        BrandPage,
        BrandReportPage,
        BrandOverviewPage,
        BrandBasicInfoPage,
        BrandDefaultSellingPointPage,
        MainBrandReportPage,
        UnitBrandReportPage,
        SellingPointBrandReportPage,
    ],
})

export class BrandModule { }
