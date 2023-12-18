import { AclModel } from '../models/acl';
import { Injectable } from '@angular/core';
import { ConfigData } from '../interfaces/config-data';
import { from, BehaviorSubject, Subject } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
@Injectable()
export class AclService implements ConfigData {
	public aclModel: AclModel;
	public onAclUpdated$: BehaviorSubject<AclModel>;

	constructor(
	) {
		// set initial permission model
		this.aclModel = new AclModel();
		this.onAclUpdated$ = new BehaviorSubject(this.aclModel);

		// this.authService.getUserRoles().subscribe(roles => {
		// 	this.setCurrrentUserRoles(roles);
		// });

		// subscribe to credential changed, eg. after login response
		// this.authService.onCredentialUpdated$
		// 	.pipe(mergeMap(accessData => this.authService.getUserRoles()))
		// 	.subscribe(roles => this.setCurrrentUserRoles(roles));

		// subscribe to acl data observable
		this.onAclUpdated$.subscribe(acl => {
			const permissions = Object.keys(acl.permissions).map((key) => {
				return acl.permissions[key];
			});
			
			// merge current user roles
			const roles = Object.assign({}, this.aclModel.currentUserRoles, {
				// default user role is GUEST
				GUEST: () => {
					// return this.authService.isAuthorized().toPromise();
				}
			});
		});
	}

	/**
	 * Set AclModel and fire off event that all subscribers will listen to
	 * @param aclModel
	 */
	setModel(aclModel: AclModel): any {
		aclModel = Object.assign({}, this.aclModel, aclModel);
		this.onAclUpdated$.next(aclModel);
	}

	setCurrrentUserRoles(roles: any): any {
		// update roles if the credential data has roles
		if (roles != null) {
			this.aclModel.currentUserRoles = {};
			roles.forEach(role => {
				this.aclModel.currentUserRoles[role] = this.aclModel.permissions[role];
			});
			// set updated acl model back to service
			this.setModel(this.aclModel);
		}
	}
}
