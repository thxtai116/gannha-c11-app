import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import { FilesManagerComponent, FilesManagerConfigModel } from '../../../partials/smarts/files/files.module';

import { SubheaderService } from '../../../../core/core.module';

@Component({
    selector: 'rbp-folders-page',
    templateUrl: './folders.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoldersPage implements OnInit {
    @ViewChild(FilesManagerComponent, { static: false }) filesManager: FilesManagerComponent;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    };

    config: FilesManagerConfigModel = new FilesManagerConfigModel();

    constructor(
        private _subheaderService: SubheaderService,
        private _translate: TranslateService
    ) {
        this.config = {
            Buttons: ['*'],
            AcceptedTypes: ['*'],
            Limitted: -1,
            IncludeHidden: true,
        };
    }

    ngOnInit() {
        this.bindBreadcumbs();
    }

    ngAfterViewInit(): void {
        this.bindSubscribes();
    }

    private bindBreadcumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: this._translate.instant("RESOURCES.FOLDERS.TITLE"), page: `/folders` }
        ]);
    }

    private bindSubscribes(): void {
        this.filesManager.viewControl.loading$.subscribe(value => {
            this.viewControl.loading$.next(value);
        });
    }
}
