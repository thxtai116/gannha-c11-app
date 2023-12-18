import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { TranslateModule } from '@ngx-translate/core';

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
    MatButtonToggleModule,
} from "@angular/material";

import { DiscountsPage } from './discounts.page'
import { DiscountsListPage } from './pages/discounts-list/discounts-list.page';
import { DiscountsFormPage } from './pages/discounts-form/discounts-form.page';
import { DiscountsDetailPage } from './pages/discounts-detail/discounts-detail.page';
import { DiscountsBasicInfoPage } from './pages/discounts-basic-info/discounts-basic-info.page';

import { DiscountsState, DiscountsDetailState } from './states/index';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr, 'fr');

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
        MatExpansionModule,
        MatRadioModule,
        MatButtonToggleModule,

        NgxMatSelectSearchModule,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: '',
                component: DiscountsPage,
                children: [
                    {
                        path: '',
                        component: DiscountsListPage
                    },
                    {
                        path: 'create',
                        component: DiscountsFormPage
                    },
                    {
                        path: ':id',
                        component: DiscountsDetailPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'basic-info'
                            },
                            {
                                path: 'basic-info',
                                component: DiscountsBasicInfoPage
                            }
                        ]
                    }
                ]
            }
        ])
    ],
    providers: [
        //State
        DiscountsState,
        DiscountsDetailState,
        //Service
    ],
    declarations: [
        //Pages
        DiscountsPage,
        DiscountsListPage,
        DiscountsFormPage,
        DiscountsDetailPage,
        DiscountsBasicInfoPage,
        //Components
    ],
    entryComponents: [
    ]
})
export class DiscountsModule { }
