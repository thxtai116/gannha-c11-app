import { Component, OnInit, Input } from '@angular/core';
import { CategoryModel } from '../../../../../../core/models';
import { MatDialog } from '@angular/material';
import { CategoriesSelectorComponent } from '../../../../../pages/shared/components';

@Component({
  selector: 'm-category-list',
  templateUrl: './category-list.component.html',
  //styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  @Input() selectedCategories: CategoryModel[] = [];

  constructor() { }

  ngOnInit() {
  }

  openDialog(): void {

  }
}
