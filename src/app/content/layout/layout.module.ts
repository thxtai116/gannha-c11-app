
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './header/header.component';
import { AsideLeftComponent } from './aside/aside-left.component';
import { FooterComponent } from './footer/footer.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { BrandComponent } from './header/brand/brand.component';
import { MenuSectionComponent } from './aside/menu-section/menu-section.component';
import { TopbarComponent } from './header/topbar/topbar.component';
import { CoreModule } from '../../core/core.module';
import { UserProfileComponent } from './header/topbar/user-profile/user-profile.component';
import { SearchDropdownComponent } from './header/topbar/search-dropdown/search-dropdown.component';
import { NotificationComponent } from './header/topbar/notification/notification.component';
import { QuickActionComponent } from './header/topbar/quick-action/quick-action.component';
import { MenuHorizontalComponent } from './header/menu-horizontal/menu-horizontal.component';
import { AsideRightComponent } from './aside/aside-right/aside-right.component';
import { SearchDefaultComponent } from './header/topbar/search-default/search-default.component';
import { HeaderSearchComponent } from './header/header-search/header-search.component';
import { LanguageSelectorComponent } from './header/topbar/language-selector/language-selector.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatProgressBarModule, MatTabsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule } from '@angular/material';

import { ContentLoaderModule } from "@netbasal/ngx-content-loader";
import { TranslateModule } from '@ngx-translate/core';
import { LoadingBarModule } from '@ngx-loading-bar/core';

import { ListTimelineModule } from '../partials/partials/layout/quick-sidebar/list-timeline/list-timeline.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};

@NgModule({
	declarations: [
		HeaderComponent,
		FooterComponent,
		SubheaderComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		SearchDropdownComponent,
		NotificationComponent,
		QuickActionComponent,
		LanguageSelectorComponent,

		// aside left menu components
		AsideLeftComponent,
		MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		// aside right component
		AsideRightComponent,

		SearchDefaultComponent,

		HeaderSearchComponent,

	],
	exports: [
		HeaderComponent,
		FooterComponent,
		SubheaderComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		SearchDropdownComponent,
		NotificationComponent,
		QuickActionComponent,
		LanguageSelectorComponent,

		// aside left menu components
		AsideLeftComponent,
		// MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		// aside right component
		AsideRightComponent
	],
	providers: [
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		}
	],
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,

		TranslateModule.forChild(),

		PerfectScrollbarModule,

		CoreModule,

		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatProgressSpinnerModule,

		ListTimelineModule,
		LoadingBarModule,
		ContentLoaderModule
	]
})
export class LayoutModule { }
