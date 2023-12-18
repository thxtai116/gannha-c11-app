import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import {
	StorageUtility,
	LocalStorageKey,
	RoutePath
} from "../../../../core/core.module";

@Component({
	selector: 'm-sign-in',
	templateUrl: './sign-in.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {

	constructor(
		private _storageUtil: StorageUtility,
		private _router: Router,
	) {
	}

	ngOnInit(): void {
		var returnUrl = this._storageUtil.get(LocalStorageKey.returnUrl);

		if (returnUrl && returnUrl.length > 0 && returnUrl.indexOf(RoutePath.login) === -1) {
			let urlPaths = returnUrl.split('?');
			let params = {}
			if (urlPaths.length > 1) {
				returnUrl = urlPaths[0];
				urlPaths[1] = '?' + urlPaths[1];
				let match;
				let regex = /[?&]([^=#]+)=([^&#]*)/g;
				while (match = regex.exec(urlPaths[1])) {
					params[match[1]] = decodeURIComponent(match[2]);
				}
			}

			this._storageUtil.set(LocalStorageKey.returnUrl, "");

			this._router.navigate([returnUrl], { queryParams: params });
		} else {
			this._storageUtil.set(LocalStorageKey.returnUrl, "");

			this._router.navigate([""]);
		}
	}
}
