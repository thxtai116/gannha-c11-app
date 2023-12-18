import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

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
import { PromotionsPage } from './promotions.page';
import { PromotionsListPage } from './pages/promotions-list/promotions-list.page';
import { PromotionsDetailPage } from './pages/promotions-detail/promotions-detail.page';
import { PromotionsDetailState } from './states';
import { MenuService } from './services';
import { PromotionsBasicInfoPage } from './pages/promotions-basic-info/promotions-basic-info.page';
import { PromotionsCustomerPage } from './pages/promotions-customer/promotions-customer.page';
import { PromotionCustomerStatusBadgeComponent } from './components/promotion-customer-status-badge/promotion-customer-status-badge.component';

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

        NgxMatSelectSearchModule,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: '',
                component: PromotionsPage,
                children: [
                    {
                        path: '',
                        component: PromotionsListPage,
                    },
                    {
                        path: ':id',
                        component: PromotionsDetailPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'customers'
                            },
                            {
                                path: 'basic-info',
                                component: PromotionsBasicInfoPage
                            },
                            {
                                path: 'customers',
                                component: PromotionsCustomerPage
                            }
                        ]
                    }
                ]
            }
        ])
    ],
    providers: [
        PromotionsDetailState,
        MenuService
    ],
    declarations: [
        PromotionsPage,
        PromotionsListPage,
        PromotionsDetailPage,
        PromotionsBasicInfoPage,
        PromotionsCustomerPage,
        PromotionCustomerStatusBadgeComponent,
    ],
    entryComponents: [
    ]
})
export class PromotionsModule { }
