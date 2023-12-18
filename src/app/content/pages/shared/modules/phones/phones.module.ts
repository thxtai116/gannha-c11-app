import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../../core/core.module';
import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PhonesComponent } from './phones.component';
import { TranslateModule } from '@ngx-translate/core';

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
        CoreModule,
        TranslateModule.forChild()
    ],
    declarations: [PhonesComponent],
    exports: [PhonesComponent],
})
export class PhonesModule { }
