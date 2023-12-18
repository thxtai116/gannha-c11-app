import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MatIconModule, MatFormFieldModule, MatCheckboxModule, MatDatepickerModule, MatInputModule, MatSelectModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { PartialsModule } from '../../partials/partials.module';

import { CoreModule } from '../../../../core/core.module';

import { SubmissionStatusBadgeComponent, SubmissionsDetailComponent, SubmissionRejectReasonsComponent, SubmissionInterviewComponent} from './components';

import { TagsModule } from '../../partials/content/general/tags/tags.module';
import { SharedModule } from '../../../pages/shared/shared.module';

@NgModule({
    declarations: [
        SubmissionsDetailComponent,
        SubmissionRejectReasonsComponent,
        SubmissionStatusBadgeComponent,
        SubmissionInterviewComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        
        MatButtonModule,
        MatInputModule,
        MatDialogModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatDatepickerModule,
        TagsModule,
        PartialsModule,
        CoreModule,

        TranslateModule.forChild(),
    ],
    exports: [
        SubmissionStatusBadgeComponent,
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
    ],
    entryComponents: [
        SubmissionsDetailComponent,
        SubmissionRejectReasonsComponent,
        SubmissionInterviewComponent,
    ]
})
export class SubmissionsModule { }

export * from "./components/index";