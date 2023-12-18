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

import { CommerceCategoriesState } from './states';

import { CommerceCategoriesPage } from './commerce-categories.page';
import { CommerceCategoriesListPage } from './pages/commerce-categories-list/commerce-categories-list.page';

import { CommerceCategoriesFormComponent } from './components/commerce-categories-form/commerce-categories-form.component';
import { CommerceCategoriesDetailComponent } from './components/commerce-categories-detail/commerce-categories-detail.component';

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
                component: CommerceCategoriesPage,
                children: [
                    {
                        path: '',
                        component: CommerceCategoriesListPage
                    },
                ]
            }
        ])
    ],
    providers: [
        //State
        CommerceCategoriesState,
        //Service
    ],
    declarations: [
        //Pages
        CommerceCategoriesPage,
        CommerceCategoriesListPage,
        //Components
        CommerceCategoriesFormComponent,
        CommerceCategoriesDetailComponent,
    ],
    entryComponents: [
        CommerceCategoriesFormComponent,
        CommerceCategoriesDetailComponent
    ]
})
export class CommerceCategoriesModule { }
