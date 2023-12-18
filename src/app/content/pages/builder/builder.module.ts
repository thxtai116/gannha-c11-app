import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { BuilderComponent } from './builder.component';
import { PartialsModule } from '../../partials/partials/partials.module';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { HighlightModule } from 'ngx-highlightjs';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
	imports: [
		CommonModule,
		LayoutModule,
		PartialsModule,
		FormsModule,
		MatTabsModule,
		PerfectScrollbarModule,
		HighlightModule.forRoot({}),
		RouterModule.forChild([
			{
				path: '',
				component: BuilderComponent
			}
		])
	],
	providers: [],
	declarations: [BuilderComponent]
})
export class BuilderModule { }
