import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
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
    MatExpansionModule,
    MatRadioModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { CommerceProductsState } from './states';

import { ProductsPage } from './products.page';
import { ProductsListPage } from './pages/products-list/products-list.page';
import { ProductsFormPage } from './pages/products-form/products-form.page';
import { ProductsDetailPage } from './pages/products-detail/products-detail.page';

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

        TranslateModule.forChild(),

        RouterModule.forChild([
            {
                path: '',
                component: ProductsPage,
                children: [
                    {
                        path: '',
                        component: ProductsListPage
                    },
                    {
                        path: 'create',
                        component: ProductsFormPage
                    },
                    {
                        path: ':id',
                        component: ProductsDetailPage
                    }
                ]
            }
        ])
    ],
    providers: [
        //State
        CommerceProductsState,
        //Service
    ],
    declarations: [
        //Pages
        ProductsPage,
        ProductsListPage,
        ProductsFormPage,
        ProductsDetailPage,
        //Components
    ],
    entryComponents: [
    ]
})
export class ProductsModule { }
