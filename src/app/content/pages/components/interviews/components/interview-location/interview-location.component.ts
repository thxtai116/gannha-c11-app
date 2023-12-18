import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'm-interview-location',
  templateUrl: './interview-location.component.html',
  styleUrls: ['./interview-location.component.scss']
})
export class InterviewLocationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InterviewLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
