import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	OnInit,
	ViewChild,
} from '@angular/core';

import { Observable } from 'rxjs';

import {
	DomSanitizer,
	SafeStyle
} from '@angular/platform-browser';

import { GlobalState, AuthService, ProfileModel } from "../../../../../core/core.module";

@Component({
	selector: 'm-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-topbar__user-profile m-topbar__user-profile--img m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	@ViewChild('mProfileDropdown', { static: true }) mProfileDropdown: ElementRef;

	userInfo: Observable<ProfileModel> = new Observable<ProfileModel>();

	avatarBg: SafeStyle = '';

	constructor(
		private sanitizer: DomSanitizer,
		private _globalState: GlobalState,
		private _authService: AuthService,
	) {
		this.avatarBg = this.sanitizer.bypassSecurityTrustStyle('url(./assets/app/media/img/misc/user_profile_bg.jpg)');
	}

	ngOnInit(): void {
		this.userInfo = this._globalState.userInfoSub$.asObservable();
	}

	logout(): void {
		let url = this._authService.logout();

		window.location.href = url;
	}
}
