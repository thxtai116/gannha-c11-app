import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { RawUnitsPage } from './raw-units.page';
import { VerificationRequestsListPage } from './pages/verification-requests-list/verification-requests-list.page';
import { VerificationRequestsDetailsPage } from './pages/verification-requests-details/verification-requests-details.page';
import { RawUnitsListPage } from './pages/raw-units-list/raw-units-list.page';

import { RawUnitsState } from './states';

import { SharedModule } from '../../shared/shared.module';

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
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatTabsModule,
    MatBadgeModule
} from '@angular/material';

import { RawUnitsDetailComponent } from './components/raw-units-detail/raw-units-detail.component';
import { RawUnitsUpdateFormComponent } from './components/raw-units-update-form/raw-units-update-form.component';
import { RawUnitsDeleteFormComponent } from './components/raw-units-delete-form/raw-units-delete-form.component';
import { RawUnitsMapFormComponent } from './components/raw-units-map-form/raw-units-map-form.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        LayoutModule,
        PartialsModule,
        SharedModule,

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
        MatTabsModule,
        MatBadgeModule,

        RouterModule.forChild([
            {
                path: '',
                component: RawUnitsPage,
                children: [
                    {
                        path: '',
                        component: VerificationRequestsListPage
                    },
                    {
                        path: ':id',
                        component: VerificationRequestsDetailsPage,
                        children: [
                            {
                                path: '',
                                redirectTo: 'raw-units'
                            },
                            {
                                path: 'raw-units',
                                component: RawUnitsListPage
                            }
                        ]
                    }
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
        RawUnitsState
    ],
    declarations: [
        RawUnitsPage,
        VerificationRequestsListPage,
        VerificationRequestsDetailsPage,
        RawUnitsListPage,

        RawUnitsDetailComponent,
        RawUnitsUpdateFormComponent,
        RawUnitsDeleteFormComponent,
        RawUnitsMapFormComponent,
    ],
    entryComponents: [
        RawUnitsDetailComponent,
        RawUnitsUpdateFormComponent,
        RawUnitsDeleteFormComponent,
        RawUnitsMapFormComponent,
    ]
})
export class RawUnitsModule { }