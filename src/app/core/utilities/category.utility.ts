import { Injectable } from '@angular/core';
import { CategoryModel } from "../models/category.model";
import { LanguagePipe } from '../pipes';

@Injectable()
export class CategoryUtility {

    getCategories(ids: string[], categories: CategoryModel[]): CategoryModel[] {
        let cats: CategoryModel[] = [];

        for (let id of ids) {
            let cat = this.getCategoryById(id, categories);

            if (cat && cat.Id.length > 0) {
                cats.push(cat);
            }
        }

        return cats;
    }

    getCategoryById(id: string, categories: CategoryModel[]): CategoryModel {
        let stack: Array<CategoryModel> = [];

        for (let cat of categories) {
            stack.push(cat);

            while (stack.length > 0) {
                let top = stack.pop();

                if (top.Id === id) return top;

                if (top.Childs && top.Childs.length > 0) {
                    for (let child of top.Childs) stack.push(child);
                }
            }
        }
    }

    getSubCategories(categories: CategoryModel[]): CategoryModel[] {
        let subCategories: CategoryModel[] = [];

        for (let cat of categories) {
            if (cat.Childs && cat.Childs.length > 0) {
                for (let subCat of cat.Childs) {
                    this.getLeave(subCat, subCategories);
                }
            } else {
                subCategories.push(cat);
            }
        }

        return subCategories;
    }

    initFilterCategories(categories: CategoryModel[], includeAll: boolean = true): any[] {
        let cats = includeAll ? [
            {
                id: "All",
                text: "Tất cả"
            }
        ] : [];

        cats = cats.concat(categories.map(x => {
            return {
                id: x.Id,
                text: new LanguagePipe().transform(x.Name)
            }
        }));

        return cats;
    }

    private getLeave(cat: CategoryModel, subCategories: CategoryModel[]) {
        if (cat.Childs && cat.Childs.length > 0) {
            for (let subCat of cat.Childs) {
                this.getLeave(subCat, subCategories);
            }
        } else {
            subCategories.push(cat);
        }
    }
}