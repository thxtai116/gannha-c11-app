import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import {
    SellingPointService,

    SellingPointBasicViewModel,

    SellingPointModel,
    ResourceModel,

    LanguagePipe,

    ResourceType,

    ScheduleUtility
} from '../../../../../../core/core.module';

import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'm-notification-selling-point-detail',
    templateUrl: './selling-point-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointDetailComponent implements OnInit {

    @Input() resourceId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewModel: any = {
        sellingPoint: new SellingPointBasicViewModel()
    }

    form: FormGroup;

    storageEndpoint: string = environment.storageEndpoint;

    constructor(
        private _sellingPointService: SellingPointService,
        private _scheduleUtil: ScheduleUtility
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.resourceId$.subscribe(value => {
                if (value) {
                    this.init(value);
                }
            })
        );
    }

    private init(id: string): void {
        if (id) {
            this.viewControl.loading$.next(true);

            Promise.all([
                this._sellingPointService.get(id)
            ]).then(value => {
                this.viewModel.sellingPoint = this.parseToViewModel(value[0]);

                this.setForm(value[0]);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private parseToViewModel(sellingPoint: SellingPointModel): SellingPointBasicViewModel {
        let vm = new SellingPointBasicViewModel();

        vm.Title = new LanguagePipe().transform(sellingPoint.Detail.Title);
        vm.TitleEn = new LanguagePipe().transform(sellingPoint.Detail.Title, "en");
        vm.Description = new LanguagePipe().transform(sellingPoint.Detail.Description);
        vm.DescriptionEn = new LanguagePipe().transform(sellingPoint.Detail.Description, "en");
        vm.StartDate = new Date(sellingPoint.StartDate);
        vm.EndDate = new Date(sellingPoint.EndDate);
        vm.Status = sellingPoint.Status;
        vm.Icon = sellingPoint.Icon;
        vm.Order = sellingPoint.Order;
        vm.TimeRanges = sellingPoint.TimeRanges;
        vm.Tags = sellingPoint.Tags;
        vm.RepeatString = this._scheduleUtil.toString(sellingPoint.Repeat);

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();

            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;

            if (gallery.Type === ResourceType.Video) {
                vm.Video.push(gallery.Url);
            }
            else if (gallery.Type === ResourceType.Image) {
                vm.Posters.push(gallery);
            }
        }

        vm.Actions = sellingPoint.Actions.map(x => x.Service);

        return vm;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Video: new FormControl(''),
            Posters: new FormControl([]),
            Actions: new FormControl([]),
            TimeRanges: new FormControl([])
        });
    }

    private setForm(sellingPoint: SellingPointModel) {
        let posters: ResourceModel[] = [];

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();
            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;
            if (gallery.Type === ResourceType.Image) {
                posters.push(gallery);
            }
        }
        this.form.get('Video').setValue(sellingPoint.Gallery.filter(x => x.Type == ResourceType.HLS || x.Type == ResourceType.Video) || []);
        this.form.get('Posters').setValue(posters);
        this.form.get('Actions').setValue(sellingPoint.Actions.map(x => x.Service));
        this.form.get('TimeRanges').setValue(sellingPoint.TimeRanges);
    }
}
