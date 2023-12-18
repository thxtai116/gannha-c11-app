import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatChipsModule,
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { ContentLoaderModule } from '@netbasal/ngx-content-loader';

import { CoreModule } from '../../../../../core/core.module';

import {
    CallToActionComponent,
    CallToActionContentComponent,
    CallServiceComponent,
    CallServiceContentComponent,
    OrderServiceComponent,
    OrderServiceContentComponent,
    PromotionCodeComponent,
    PromotionCodeContentComponent,

    ActionsPreviewSheetComponent,
} from './components';

import { SellingPointServiceComponent } from './components/selling-point-service/selling-point-service.component';
import { PartialsModule } from '../../../../partials/partials/partials.module';
import { ServiceConnectionContentComponent } from './components/service-connection-content/service-connection-content.component';
import { MembershipComponent } from './components/membership/membership.component';
import { MembershipContentComponent } from './components/membership-content/membership-content.component';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatChipsModule,

        CoreModule,
        PartialsModule,

        ContentLoaderModule,

        TranslateModule.forChild(),
    ],
    declarations: [
        ServiceConnectionContentComponent,
        SellingPointServiceComponent,

        CallToActionComponent,
        CallToActionContentComponent,

        CallServiceComponent,
        CallServiceContentComponent,

        OrderServiceComponent,
        OrderServiceContentComponent,

        PromotionCodeComponent,
        PromotionCodeContentComponent,

        MembershipComponent,
        MembershipContentComponent,
        
        ActionsPreviewSheetComponent,
    ],
    exports: [
        ServiceConnectionContentComponent,

        CallToActionComponent,
        SellingPointServiceComponent,

        CallServiceComponent,
        CallServiceContentComponent,

        OrderServiceComponent,
        OrderServiceContentComponent,

        PromotionCodeComponent,
        PromotionCodeContentComponent,

        ActionsPreviewSheetComponent,
    ],
    entryComponents: [
        CallToActionComponent,
        CallToActionContentComponent,

        CallServiceComponent,
        CallServiceContentComponent,

        OrderServiceComponent,
        OrderServiceContentComponent,

        PromotionCodeComponent,
        PromotionCodeContentComponent,

        MembershipComponent,
        MembershipContentComponent,

        ActionsPreviewSheetComponent,
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'm-mat-dialog-container__wrapper'
            }
        },
    ]
})
export class SellingPointServiceModule { }

export * from "./models/index";

export * from "./view-models/index";

export * from "./components/index";

export * from "./datasources/index";

export * from "./consts/index";