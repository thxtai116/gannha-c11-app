import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../../../core/core.module';
import {
	MatProgressSpinnerModule,
	MatProgressBarModule,
	MatDialogModule,
	MatIconModule,
	MAT_DIALOG_DATA,
	MatDialogRef,
	MatChipsModule,
	MatButtonModule
} from '@angular/material';
import { CategoryListComponent } from './category-list.component';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		MatProgressSpinnerModule,
        MatProgressBarModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule
	],
	declarations: [CategoryListComponent],
	exports: [CategoryListComponent],
	providers: [
		{ provide: MAT_DIALOG_DATA, useValue: {} },
		{ provide: MatDialogRef, useValue: {} }
	]
})
export class CategoryListModule {}
