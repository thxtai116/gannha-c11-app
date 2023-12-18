import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    MatDatepickerModule
} from "@angular/material";

import { AccountComponent } from './account.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { AccountState } from './states';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

import { ImagesCroperModule } from '../../../partials/index';

import { ImageProfileSelectorComponent } from './components/image-profile-selector/image-profile-selector.component';

@NgModule({
    declarations: [
        AccountComponent,
        ChangePasswordComponent,
        UserProfileComponent,

        ImageProfileSelectorComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        SharedModule,
        CoreModule,
        PartialsModule,

        ImagesCroperModule,

        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatPaginatorModule,
        MatTableModule,
        MatDatepickerModule,
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
                component: AccountComponent,
                children: [
                    {
                        path: '',
                        redirectTo: ''
                    },
                    {
                        path: 'change-password',
                        component: ChangePasswordComponent
                    },
                    {
                        path: 'user-profile',
                        component: UserProfileComponent
                    }
                ]
            }
        ])
    ],
    providers: [
        AccountState
    ]
})
export class AccountModule { }
