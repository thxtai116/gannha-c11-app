import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

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
    MatChipsModule
} from "@angular/material";

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { PlacesPage } from './places.page';
import { PlacesListPage } from './pages/places-list/places-list.page';
import { PlacesFormPage } from './pages/places-form/places-form.page';
import { PlacesDetailPage } from './pages/places-detail/places-detail.page';

@NgModule({
    declarations: [
        PlacesPage,
        PlacesListPage,
        PlacesFormPage,
        PlacesDetailPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        LayoutModule,
        SharedModule,
        CoreModule,
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
                path: '',
                component: PlacesPage,
                children: [
                    {
                        path: '',
                        component: PlacesListPage,
                    },
                    {
                        path: 'create',
                        component: PlacesFormPage
                    },
                    {
                        path: ':id',
                        component: PlacesDetailPage
                    }
                ]
            }
        ])
    ],
})
export class PlacesModule { }
