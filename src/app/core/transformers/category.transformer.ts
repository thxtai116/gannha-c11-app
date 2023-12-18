import { CategoryModel } from "../models";
import { CategoryViewModel, CategoryTreeViewModel } from "../view-models";
import { Status } from "../enums";
import { LanguagePipe } from '../pipes';

import { environment as env } from "../../../environments/environment";

export class CategoryTransformer {
    toCategoryOverView(cate: CategoryModel): CategoryViewModel {
        let vm = new CategoryViewModel();

        vm.Id = cate.Id;
        vm.Name = new LanguagePipe().transform(cate.Name);
        vm.Image = `${env.storageEndpoint}${cate.Icon[0]}.png`;
        vm.Status = cate.Status;

        return vm;
    }

    toCategoryTreeOverview(cate: CategoryModel): CategoryTreeViewModel {
        let vm = new CategoryTreeViewModel();

        vm.Id = cate.Id;
        vm.ViName = new LanguagePipe().transform(cate.Name);
        vm.EnName = new LanguagePipe().transform(cate.Name, "en");
        vm.Description = new LanguagePipe().transform(cate.Description);

        vm.Status = cate.Status;
        vm.Icon = cate.Icon;

        if (!!cate.Childs && cate.Childs.length > 0) {
            for (let child of cate.Childs) {
                vm.Childs.push(this.toCategoryTreeOverview(child));
            }
        }

        return vm;
    }

    getTagNameByStatus(status: Status): string {
        let statusText: string = '';
        switch (status) {
            case Status.Active: {
                statusText = 'Active';
                break;
            }
            case Status.Deactive: {
                statusText = 'Deactive';
                break;
            }
            case Status.Expired: {
                statusText = 'Expired';
                break;
            }
            case Status.Pending: {
                statusText = 'Pending';
                break;
            }
        }
        return statusText;
    }
}