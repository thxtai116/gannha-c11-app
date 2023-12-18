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
    MatProgressSpinnerModule,
    MatCardModule,
    MatListModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../../../../core/core.module';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PortletModule } from '../../../../partials/partials/content/general/portlet/portlet.module';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { TopChartComponent } from './components/top-chart/top-chart.component';

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
        MatListModule,
        MatRadioModule,
        MatCheckboxModule,
        MatCardModule,
        PortletModule,
        MatProgressSpinnerModule,
        CoreModule,
        NgxMatDrpModule,
        TranslateModule.forChild(),
        NgxChartsModule
    ],
    declarations: [
        LineChartComponent,
        TopChartComponent
    ],
    entryComponents: [
    ],
    exports: [
        LineChartComponent,
        TopChartComponent
    ],
})
export class ChartsModule { }
