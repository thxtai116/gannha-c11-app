import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { UserInfoModel, SubheaderService, RoleType } from '../../../../../../core/core.module';

import { UsersDetailState } from '../../states';

import { MenuService } from '../../services';

import { BrandsAssignmentComponent } from '../../components/brands-assignment/brands-assignment.component';
import { UnitsAssignmentComponent } from '../../components/units-assignment/units-assignment.component';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-users-assignments',
    templateUrl: './users-assignments.page.html'
})
export class UsersAssignmentsPage implements OnInit {

    @ViewChild('assignments', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["User", false]
    ]);

    lang: string = "vi";

    viewControl: any = {
        ready: false,
    }

    viewData: any = {
        user: new UserInfoModel(),
        user$: new BehaviorSubject<UserInfoModel>(null)
    }

    componentRef: ComponentRef<any>;

    constructor(
        private _usersDetailState: UsersDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _translate: TranslateService,
        private _resolver: ComponentFactoryResolver
    ) {
    }

    ngOnInit(): void {
        this.viewData.user = this._usersDetailState.user$.getValue();

        if (this.viewData.user) {
            this._readyConditions.set("User", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        if (this.componentRef)
            this.componentRef.destroy();
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._usersDetailState.menu$.next(this._menuService.getUserDetailMenu());

            this.renderAssignmentComponent();
        }
    }

    private renderAssignmentComponent(): void {
        const factory = this.getAssignmentComponentFactory(this.viewData.user.RoleNames[0]);

        if (factory) {
            this.componentRef = this.entry.createComponent(factory);

            this.componentRef.instance.user$ = this.viewData.user$;
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "USERS.LIST", page: '/users' },
            { title: this.viewData.user.DisplayName, page: `/users/${this.viewData.user.Id}` },
            { title: "USERS.ASSIGNMENTS", page: `/users/${this.viewData.user.Id}/assignments` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._usersDetailState.user$.subscribe(value => {
                if (value) {
                    this.viewData.user = value;
                    this.viewData.user$.next(value);

                    this._readyConditions.set("User", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("User")) {
                    this.bindBreadcrumbs();
                }
            })
        )
    }

    private getAssignmentComponentFactory(role: string): any {
        let factory: any = null;

        switch (role) {
            case RoleType.Supervisor:
            case RoleType.BrandAdmin:
                factory = this._resolver.resolveComponentFactory(BrandsAssignmentComponent);

                break;

            case RoleType.BrandSup:
            case RoleType.Locator:
                factory = this._resolver.resolveComponentFactory(UnitsAssignmentComponent);

                break;
        }

        return factory;
    }
}
