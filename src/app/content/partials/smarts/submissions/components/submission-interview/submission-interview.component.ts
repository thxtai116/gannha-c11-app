import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DateTimeUtility, CoordinateModel, ValidCoordinates, SystemAlertService, Interview, RecruitmentService, UnitService, UnitModel } from '../../../../../../core/core.module';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateService } from '@ngx-translate/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'm-submission-interview',
  templateUrl: './submission-interview.component.html',
  styleUrls: ['./submission-interview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SubmissionInterviewComponent implements OnInit {
  form: FormGroup;

  viewControl: any = {
    loading$: new BehaviorSubject<boolean>(false),
    submitting: false,
  }

  times: any[] = [];
  unit: UnitModel = new UnitModel();
  title: string = "";
  editMode: boolean = false;

  constructor(
    private _dateTimeUtility: DateTimeUtility,
    public dialogRef: MatDialogRef<SubmissionInterviewComponent>,
    private _systemAlertService: SystemAlertService,
    private _unitService: UnitService,
    private _translate: TranslateService,
    private _recruitmentService: RecruitmentService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.times = this.generateTime();
    this.form = this.generateForm();
  }

  ngOnInit() {
    this.init();
  }

  async onSubmit() {
    if (this.viewControl.submitting)
      return;

    this.viewControl.submitting = true;

    const controls = this.form.controls;

    if (!this.form.get('IsOnline').value) {
      if (this.form.invalid) {
        if (this.form.get('IsOnline').value) {
          this.viewControl.submitting = false;
        }

        Object.keys(controls).forEach(controlName =>
          controls[controlName].markAsTouched()
        );

        this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

        this.viewControl.submitting = false;

        return;
      }
    }

    let interview = this.parseForm(this.form);

    if (interview.Time < new Date()) {
      this._systemAlertService.error(this._translate.instant("SUBMISSION.ERROR.TIME_INTERVIEW_INVALID"));
      this.viewControl.submitting = false;
      return;
    }

    this.viewControl.loading$.next(true);

    let result = await this._recruitmentService.createInterview(interview);

    this.viewControl.loading$.next(false);

    this.viewControl.submitting = false;

    if (result) {
      if (!this.editMode)
        this._systemAlertService.success(this._translate.instant("SUBMISSION.CREATE_INTERVIEW_SUCCESSFUL"));
      else
        this._systemAlertService.success(this._translate.instant("SUBMISSION.EDIT_INTERVIEW_SUCCESSFUL"));
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private init(): void {
    this.viewControl.loading$.next(true);
    Promise.all([
      this._unitService.get(this.data["unitId"]),
    ]).then(res => {
      this.unit = res[0];
      this.setFormDefaultValue();
    }).finally(() => this.viewControl.loading$.next(false));
  }

  private parseForm(form: FormGroup): Interview {
    let interview = new Interview();
    interview.ResumeId = this.data["resumeId"];
    interview.IsOnline = form.get('IsOnline').value;

    try {
      interview.Time = form.get('Date').value.toDate();
    } catch{
      interview.Time = new Date(form.get('Date').value);
    }

    let totalHours = form.get('Time').value;
    let hours = Math.floor(+totalHours);
    let minutes = (totalHours - hours) * 60;
    interview.Time.setHours(hours, minutes, 0);

    if (!interview.IsOnline) {
      interview.Note = form.get('Note').value;
      interview.Location = form.get('Address').value;
      interview.Latitude = form.get('Location').value.Latitude;
      interview.Longitude = form.get('Location').value.Longitude;
    }

    return interview;
  }

  private generateForm(): FormGroup {
    var date = new Date().setDate(new Date().getDate() + 1);
    var coordinateModel = new CoordinateModel();
    coordinateModel.Latitude = this.unit.Latitude;
    coordinateModel.Longitude = this.unit.Longitude;

    return new FormGroup({
      Address: new FormControl('', [<any>Validators.required]),
      IsOnline: new FormControl(true, [<any>Validators.required]),
      Note: new FormControl(""),
      Date: new FormControl(new Date(date)),
      Time: new FormControl(8),
      Location: new FormControl(new CoordinateModel(), [<any>ValidCoordinates.validate()]),
    });
  }

  private setFormDefaultValue() {

    this.form.get('Address').setValue(this.unit.Contact.Address["vi"]);
    var coordinateModel = new CoordinateModel();
    coordinateModel.Latitude = this.unit.Latitude;
    coordinateModel.Longitude = this.unit.Longitude;
    this.form.get('Location').setValue(coordinateModel);

    let interview: Interview = this.data["interview"];

    this.title = this._translate.instant("SUBMISSION.CREATE_INERVIEW");

    if (interview) {
      this.title = this._translate.instant("SUBMISSION.EDIT_INTERVIEW");
      this.editMode = true;

      this.form.get('IsOnline').setValue(interview.IsOnline);
      this.form.get('Date').setValue(new Date(interview.Time));

      let time = new Date(interview.Time);
      let totalHours = time.getHours() + time.getMinutes() / 60;
      this.form.get('Time').setValue(totalHours);

      if (!interview.IsOnline) {
        this.form.get('Address').setValue(interview.Location);
        this.form.get('Note').setValue(interview.Note);

        var coordinateModel = new CoordinateModel();
        coordinateModel.Latitude = interview.Latitude;
        coordinateModel.Longitude = interview.Longitude;

        this.form.get('Location').setValue(coordinateModel);
      }
    }
  }

  private generateTime(): any[] {
    let times: any[] = [];

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 1; j += 0.25) {
        let value = i + j;

        let time = {
          value: value,
          text: this._dateTimeUtility.convertTotalHoursToTimeString(value.toString())
        }

        times.push(time);
      }
    }

    times.push({
      value: 24,
      text: this._dateTimeUtility.convertTotalHoursToTimeString("24")
    });

    return times;
  }

}
