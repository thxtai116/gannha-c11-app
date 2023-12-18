import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';


import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { OrdersPage } from './orders.page';

import { OrdersListPage } from './pages/orders-list/orders-list.page';
import { OrdersDetailPage } from './pages/orders-detail/orders-detail.page';
import { OrdersBasicInfoPage } from './pages/orders-basic-info/orders-basic-info.page';
import { OrdersNotesPage } from './pages/orders-notes/orders-notes.page';

import { OrderItemsListComponent } from "./components/index";

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
    MatDividerModule,
    MatCardModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { OrdersState, OrdersDetailState } from './states';

import { MenuService } from './services';

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
        MatDividerModule,
        MatCardModule,

        NgxMatSelectSearchModule,
        NgxDaterangepickerMd,

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: '',
                component: OrdersPage,
                children: [
                    {
                        path: '',
                        component: OrdersListPage
                    },
                    {
                        path: ':id',
                        component: OrdersDetailPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'basic-info'
                            },
                            {
                                path: 'basic-info',
                                component: OrdersBasicInfoPage
                            },
                            {
                                path: 'notes',
                                component: OrdersNotesPage
                            },
                        ]
                    }
                ]
            }
        ])
    ],
    providers: [
        //State
        OrdersState,
        OrdersDetailState,
        //Service
        MenuService
    ],
    declarations: [
        //Pages
        OrdersPage,
        OrdersListPage,
        OrdersDetailPage,
        OrdersBasicInfoPage,
        OrdersNotesPage,
        //Components
        OrderItemsListComponent
    ],
    entryComponents: [
    ]
})
export class OrdersModule { }
