import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ComponentFactoryResolver, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import { GalleryExplorerModel, DictionaryType } from '../../../../../../core/core.module';

import { DynamicFilesManagerDirective } from '../../directives';

import { FilesManagerComponent } from '../../components/files-manager/files-manager.component';

import { FilesConfigModel } from '../../models';

class ManagerTemplate {
    Name: string = "";

    Component: any;
}

@Component({
    selector: 'rbp-files-manager-container',
    templateUrl: './files-manager-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesManagerContainerComponent implements OnInit {
    @ViewChild(DynamicFilesManagerDirective, { static: true }) manager: DynamicFilesManagerDirective;

    private _obsers: any[] = [];

    viewData: any = {
        files: new Array<GalleryExplorerModel>(),
        config: new FilesConfigModel(),
        templates: new Array<ManagerTemplate>(),
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        currManager: "global"
    }

    constructor(
        private _changeRef: ChangeDetectorRef,
        private _resolver: ComponentFactoryResolver,
        public _dialogRef: MatDialogRef<FilesManagerContainerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FilesConfigModel
    ) {
        this.viewData.config = this.data;

        this.viewData.templates.push(...[
            {
                Name: "global",
                Component: FilesManagerComponent
            }
        ]);
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        if (this.viewData.config.Templates.length > 0) {
            this.viewControl.currManager = this.viewData.config.Templates[0];
        }

        this.loadTemplate();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onCancel(): void {
        this._dialogRef.close();
    }

    onSubmit(): void {
        this._dialogRef.close({
            data: this.viewData.files
        });
    }

    onSelectManager(name: string): void {
        if (name !== this.viewControl.currManager) {
            this.viewControl.currManager = name;

            this.manager.viewContainer.clear();

            this.loadTemplate();
        }
    }

    private loadTemplate(): void {
        let mgTemplate = this.viewData.templates.find(x => x.Name === this.viewControl.currManager) as ManagerTemplate;

        if (!mgTemplate)
            return;

        const componentFactory = this._resolver.resolveComponentFactory(mgTemplate.Component);

        const viewContainerRef = this.manager.viewContainer;

        const componentRef = viewContainerRef.createComponent(componentFactory);

        let instance = componentRef.instance as any;

        instance.config = this.viewData.config;

        this._obsers.push(instance.onSelectedFilesChange.subscribe(res => {
            this.viewData.files = res;
        }));

        this.viewControl.loading$ = instance.viewControl.loading$;

        this._changeRef.detectChanges();
    }
}
