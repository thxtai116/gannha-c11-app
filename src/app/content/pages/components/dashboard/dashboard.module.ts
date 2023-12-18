import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			}
		])
	],
	providers: [],
	declarations: [DashboardComponent]
})
export class DashboardModule { }
