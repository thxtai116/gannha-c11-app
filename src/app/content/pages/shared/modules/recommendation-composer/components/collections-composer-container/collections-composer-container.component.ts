import { Component, OnInit, forwardRef, Input, ElementRef, Renderer, ComponentFactoryResolver, ViewChild, ViewContainerRef, ComponentRef, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, } from '@angular/forms';

import { CategoryComposerComponent } from '../../entryComponents/category-composer/category-composer.component';
import { CollectionComposerComponent } from '../../entryComponents/collection-composer/collection-composer.component';
import { RecommendationComposerComponent } from '../../entryComponents/recommendation-composer/recommendation-composer.component';


import { CollectionResourceViewModel, } from '../../../../../../../core/core.module';

@Component({
    selector: 'm-collections-composer-container',
    templateUrl: './collections-composer-container.component.html',
    styleUrls: ['./collections-composer-container.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CollectionsComposerContainerComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsComposerContainerComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() type: string = "";

    @ViewChild('composer', { read: ViewContainerRef, static: true }) composer: ViewContainerRef;

    private _onChangeCallback: (_: any) => void = () => { };

    private _obsers: any[] = [];

    collections: CollectionResourceViewModel[] = [];

    componentRef: ComponentRef<any>;

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer,
        private _resolver: ComponentFactoryResolver
    ) { }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        if (this.componentRef)
            this.componentRef.destroy();
    }

    writeValue(obj: any): void {
        if (obj) {
            this.collections = obj;

            if (this.componentRef)
                this.componentRef.destroy();

            if (this.readonly) {
                this.initViewer(this.type, this.collections);
            } else {
                this.initComposer(this.type, this.collections);
            }
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
    }

    private emitChange() {
        this._onChangeCallback(this.collections);

        let event = new CustomEvent('change', { bubbles: true });

        this._renderer.invokeElementMethod(this._element.nativeElement, 'dispatchEvent', [event]);
    }

    private initViewer(type: string, collections: CollectionResourceViewModel[]): void {
        this.composer.clear();

        const factory = this.getComposerFactory(type);

        if (factory) {
            this.componentRef = this.composer.createComponent(factory);

            this.componentRef.instance.collections$.next(collections);
            this.componentRef.changeDetectorRef.detectChanges();
        }
    }

    private initComposer(type: string, collections: CollectionResourceViewModel[]): void {
        this.composer.clear();

        const factory = this.getComposerFactory(type);

        if (factory) {
            if (this.componentRef)
                this.componentRef.destroy();

            this.componentRef = this.composer.createComponent(factory);

            this.componentRef.instance.readonly = false;

            this.componentRef.instance.collections$.next(collections);

            this.componentRef.instance.onChange.subscribe(value => {
                this.collections = [];

                for (let model of value as CollectionResourceViewModel[]) {
                    this.collections.push(model);
                }

                this.emitChange();
            })
        }
    }

    private getComposerFactory(type: string): any {
        let factory: any = null;

        switch (type.toLocaleLowerCase()) {
            case "category":
                factory = this._resolver.resolveComponentFactory(CategoryComposerComponent);

                break;

            case "collection":
                factory = this._resolver.resolveComponentFactory(CollectionComposerComponent);

                break;

            case "recommendation":
                factory = this._resolver.resolveComponentFactory(RecommendationComposerComponent);
                break;

            default:
                factory = this._resolver.resolveComponentFactory(CategoryComposerComponent);

                break;
        }

        return factory;
    }
}
