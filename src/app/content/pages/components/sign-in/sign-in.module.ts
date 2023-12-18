import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInComponent } from './sign-in.component';
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
				component: SignInComponent
			}
		])
	],
	providers: [],
	declarations: [SignInComponent]
})
export class SignInModule {}
