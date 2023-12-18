import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    LocalStorageKey,
    Status,
    MaxWords,

    NotificationCampaignModel,
    NotificationRequestForm,

    SubheaderService,
    NotificationService,
    SystemAlertService,

    DateTimeUtility,
    StorageUtility,
    UuidUtility,
    MomentToDatePipe,
} from '../../../../../../core/core.module';

import moment from 'moment';

@Component({
    selector: 'm-notifications-form',
    templateUrl: './notifications-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false
    };

    viewData: any = {
        draftId: "",
    }

    form: FormGroup;

    minDate: moment.Moment = moment('1970-01-01');
    maxDate: moment.Moment = moment('2025-12-31');

    locale: any = {
        format: 'DD/MM/YYYY',
        displayFormat: 'DD/MM/YYYY',
    }

    attachmentType: string = "0";

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _subheaderService: SubheaderService,
        private _notificationService: NotificationService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _dateTimeUtil: DateTimeUtility,
        private _storageUtil: StorageUtility,
        private _uuidUtility: UuidUtility,
    ) {
        this.form = this.generateForm();

        this.onNotificationGroupTypeChange();


    }

    ngOnInit(): void {
        this.init();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        if (this.viewControl.submitting)
            return;

        this.viewControl.submitting = true;

        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.viewControl.submitting = false;

            return;
        }

        let requestForm = this.parseFormToModel(this.form);

        this.viewControl.loading$.next(true);

        let result = await this.push(this.attachmentType, requestForm);

        this.viewControl.loading$.next(false);
        this.viewControl.submitting = false;

        if (result) {
            this.deleteDraft(this.viewData.draftId);
            this._systemAlertService.success(this._translate.instant("NOTIFICATIONS.CREATE_SUCCESSFUL"));

            this._router.navigate(["/notification"]);
        }

    }

    onTypeChange(event: string): void {
        this.attachmentType = event;
    }

    onNotificationGroupTypeChange(): void {
        let type = this.form.get('NotificationGroupType').value;
        let devicesCtrl = this.form.get('Devices');
        let segmentCtrl = this.form.get('Segment');

        devicesCtrl.clearValidators();
        segmentCtrl.clearValidators();

        if (type === "0") {
            segmentCtrl.setValidators([<any>Validators.required]);
        } else {
            devicesCtrl.setValidators([<any>Validators.required]);
        }
    }

    private init() {
        let _id = this._route.snapshot.params["id"];

        if (_id && _id.length > 0) {
            this.viewData.draftId = _id;
            this.bindBreadcrumbs(this.viewData.draftId);

            let currentList: any[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftNotifications));

            let draft = currentList.find(x => x.Id == this.viewData.draftId);

            this.parseDraftToForm(draft.form);
        } else {
            this.bindBreadcrumbs();
            this.viewData.draftId = this._uuidUtility.UUID();
        }
    }

    private parseFormToModel(form: FormGroup): NotificationRequestForm {
        let model = new NotificationRequestForm();

        model.Title = form.get("Title").value;
        model.Content = form.get("Content").value;
        model.ResourceId = form.get("ResourceId").value;
        model.StartDate = new MomentToDatePipe().transform(form.get("StartDate").value['startDate']);
        model.SendNow = form.get("SendNow").value === '0';

        let type = form.controls["NotificationGroupType"].value;

        if (type === '0') {
            model.Segment = form.get("Segment").value;
            model.Devices = null;
        } else {
            model.Devices = form.get("Devices").value.map(x => x.Name);
            model.Segment = null;
        }

        let executedTime = this._dateTimeUtil.convertTimeStringToTotalHours(form.get("ExecutedTime").value);

        model.ExecutedTimes = [executedTime];

        return model;
    }

    private parseFormToDraft(form: FormGroup): any {
        let model: NotificationCampaignModel = new NotificationCampaignModel();
        model.Id = this.viewData.draftId;
        model.NotificationType = "N/A";
        model.Seen = 0;
        model.Total = 0;
        model.Content.Title = {
            'vi': form.get('Title').value,
        }
        model.Status = Status.Pending;

        let formGroup: any = {
            Title: form.get('Title').value,
            Content: form.get('Content').value,
            ResourceId: form.get('ResourceId').value,
            SendNow: form.get('SendNow').value,
            StartDate: new MomentToDatePipe().transform(form.get("StartDate").value['startDate']),
            ExecutedTime: form.get('ExecutedTime').value,
            Devices: form.get('Devices').value,
            Segment: form.get('Segment').value,
            NotificationGroupType: form.get('NotificationGroupType').value,
        }

        return {
            Id: this.viewData.draftId,
            model: model,
            form: formGroup,
        }
    }

    private parseDraftToForm(value: any) {
        this.form.get('Title').setValue(value.Title);
        this.form.get('Content').setValue(value.Content);
        this.form.get('ResourceId').setValue(value.ResourceId);
        this.form.get('StartDate').setValue({
            startDate: moment(value.StartDate),
            endDate: moment(new Date())
        });
        this.form.get('SendNow').setValue(value.SendNow);
        this.form.get('NotificationGroupType').setValue(value.NotificationGroupType);
        this.form.get('Devices').setValue(value.Devices);
        this.form.get('Segment').setValue(value.Segment);
        this.form.get('ExecutedTime').setValue(value.ExecutedTime);
    }

    private bindBreadcrumbs(draftId?: string): void {
        if (draftId && draftId.length > 0) {
            this._subheaderService.setBreadcrumbs([
                { title: "NOTIFICATIONS.LIST", page: '/notification' },
                { title: "NOTIFICATIONS.NEW_NOTIFICATION", page: `/notification/create/${draftId}` }
            ]);
        } else {
            this._subheaderService.setBreadcrumbs([
                { title: "NOTIFICATIONS.LIST", page: '/notification' },
                { title: "NOTIFICATIONS.NEW_NOTIFICATION", page: `/notification/create` }
            ]);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.saveDraft(this.form);
            })
        );
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Title: new FormControl('', [Validators.required, <any>MaxWords.validate(12)]),
            Content: new FormControl('', [Validators.required, <any>MaxWords.validate(70)]),
            ResourceId: new FormControl('', [Validators.required]),
            SendNow: new FormControl('0'),
            StartDate: new FormControl({
                startDate: moment(),
                endDate: moment(),
            }, [Validators.required]),
            ExecutedTime: new FormControl("8:0", [Validators.required]),
            Devices: new FormControl([]),
            Segment: new FormControl("All"),
            NotificationGroupType: new FormControl("0"),
        });
    }

    private async push(type: string = "0", form: NotificationRequestForm) {
        let result: any;

        switch (type.toLowerCase()) {
            case "1":
                result = await this._notificationService.pushBrand(form);

                break;

            case "2":
                result = await this._notificationService.pushCategory(form);

                break;

            case "3":
                result = await this._notificationService.pushCollection(form);

                break;

            default:
                result = await this._notificationService.pushSellingPoint(form);

                break;
        }

        return result;
    }

    private saveDraft(form: FormGroup) {
        let currentList: NotificationCampaignModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftNotifications));
        let draft = this.parseFormToDraft(form);
        draft.Id = this.viewData.draftId;
        if (!currentList) {
            currentList = [draft];
        } else {
            var oldItem = currentList.find(x => x.Id == draft.Id);

            if (!oldItem) {
                currentList.push(draft);
            } else {
                let index = currentList.findIndex(x => x.Id == oldItem.Id);
                currentList[index] = draft;
            }
        }
        this._storageUtil.set(LocalStorageKey.draftNotifications, JSON.stringify(currentList));


    }

    private deleteDraft(id: string) {
        let currentList: any[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftNotifications));

        if (currentList) {
            let index = currentList.findIndex(x => x.Id == id);
            currentList.splice(index, 1);
            this._storageUtil.set(LocalStorageKey.draftNotifications, JSON.stringify(currentList));
        }
    }
}
