import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { GnServiceConnectionModel, LanguagePipe } from '../../../../../../../core/core.module';

@Component({
    selector: 'm-call-service-content',
    templateUrl: 'call-service-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallServiceContentComponent {
    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(null);

    private _obsers: any[] = [];

    lang: string = "vi";

    viewModel: any = {
        Title: "",
        Phone: ""
    }

    constructor(
        private _changeRef: ChangeDetectorRef
    ) {
        this.bindSubscribes();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.service$.subscribe(value => {
                if (value) {
                    this.parseModel(value);

                    this._changeRef.detectChanges();
                }
            })
        );
    }

    private parseModel(service: GnServiceConnectionModel): void {
        this.viewModel.Title = new LanguagePipe().transform(service.Parameters.Title);
        this.viewModel.Phone = service.Parameters.Phone;
    }
}