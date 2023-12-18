import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

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
    MatDatepickerModule,
    MatRadioModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';
import { ContentLoaderModule } from '@netbasal/ngx-content-loader';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { NotificationsPage } from './notifications.page';
import { NotificationsListPage } from './pages/notifications-list/notifications-list.page';
import { NotificationsDetailPage } from './pages/notifications-detail/notifications-detail.page';
import { NotificationsFormPage } from './pages/notifications-form/notifications-form.page';

import { CoreModule } from '../../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { NotificationAttachmentComponent } from './components/notification-attachment/notification-attachment.component';

import { SellingPointDetailComponent } from './entryComponents/selling-point-detail/selling-point-detail.component';
import { CollectionDetailComponent } from './entryComponents/collection-detail/collection-detail.component';
import { BrandDetailComponent } from './entryComponents/brand-detail/brand-detail.component';
import { CategoryDetailComponent } from './entryComponents/category-detail/category-detail.component';
import { ScheduledNotificationsListPage } from './pages/scheduled-notifications-list/scheduled-notifications-list.page';

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
        MatDatepickerModule,
        MatRadioModule,

        TranslateModule.forChild(),

        ContentLoaderModule,
        NgxMaterialTimepickerModule,
        NgxDaterangepickerMd.forRoot(),

        RouterModule.forChild([
            {
                path: '',
                component: NotificationsPage,
                children: [
                    {
                        path: '',
                        component: NotificationsListPage,
                    },
                    {
                        path: 'scheduled',
                        component: ScheduledNotificationsListPage,
                    },
                    {
                        path: 'create',
                        component: NotificationsFormPage
                    },
                    {
                        path: 'create/:id',
                        component: NotificationsFormPage
                    },
                    {
                        path: ':id',
                        component: NotificationsDetailPage
                    },
                ]
            }
        ])
    ],
    providers: [],
    declarations: [
        NotificationsPage,
        NotificationsListPage,
        NotificationsFormPage,
        NotificationsDetailPage,
        ScheduledNotificationsListPage,

        NotificationAttachmentComponent,

        SellingPointDetailComponent,
        CollectionDetailComponent,
        BrandDetailComponent,
        CategoryDetailComponent,
    ],
    entryComponents: [
        SellingPointDetailComponent,
        CollectionDetailComponent,
        BrandDetailComponent,
        CategoryDetailComponent,
    ]
})
export class NotificationsModule { }