import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { LayoutModule } from '../layout/layout.module';
import { PagesRoutingModule } from './pages-routing.module';
import { PartialsModule } from '../partials/partials/partials.module';

import { CoreModule } from '../../core/core.module';

import { PagesComponent } from './pages.component';
import { ActionComponent } from './header/action/action.component';
import { ProfileComponent } from './header/profile/profile.component';

import { ErrorPageComponent } from './snippets/error-page/error-page.component';

import { AuthGuard } from './auth.guard';

@NgModule({
	declarations: [
		PagesComponent,
		ActionComponent,
		ProfileComponent,
		ErrorPageComponent,
	],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		PagesRoutingModule,
		CoreModule,
		LayoutModule,
		PartialsModule
	],
	providers: [
		AuthGuard
	]
})
export class PagesModule { }
