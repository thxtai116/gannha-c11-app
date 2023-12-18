import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    MAT_DIALOG_DEFAULT_OPTIONS
} from '@angular/material';

import { ContentLoaderModule } from '@netbasal/ngx-content-loader';

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';
import { FilesModule } from '../../../partials/smarts/files/files.module';

import { RawSellingPointsPage } from './raw-selling-points.page';

import { RawSellingPointsListPage } from './components/raw-selling-points-list/raw-selling-points-list.page';
import { RawSellingPointsFormComponent } from './components/raw-selling-points-form/raw-selling-points-form.component';
import { RawSellingPointsDetailComponent } from './components/raw-selling-points-detail/raw-selling-points-detail.component';
import { RawSellingPointsFilterComponent } from './components/raw-selling-points-filter/raw-selling-points-filter.component';
import { RawSellingPointsState } from './states';

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

        TranslateModule.forChild(),

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

        ContentLoaderModule,

        RouterModule.forChild([
            {
                path: '',
                component: RawSellingPointsPage,
                children: [
                    {
                        path: '',
                        component: RawSellingPointsListPage,
                    },
                ]
            }
        ])
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'm-mat-dialog-container__wrapper',
                height: 'auto',
                width: 'auto'
            }
        },
        RawSellingPointsState
    ],
    entryComponents: [
        RawSellingPointsFormComponent,
        RawSellingPointsDetailComponent,
        RawSellingPointsFilterComponent
    ],
    declarations: [
        RawSellingPointsPage,
        RawSellingPointsListPage,

        RawSellingPointsFormComponent,
        RawSellingPointsDetailComponent,
        RawSellingPointsFilterComponent
    ]
})
export class RawSellingPointsModule { }