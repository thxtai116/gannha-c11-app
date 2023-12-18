import { Blob } from '../../core/models';
import { IconViewModel } from "../view-models/index";

export class IconTransformer {
    convertModelToViewModel(blobs: Blob[]): IconViewModel[] {
        let viewModels: IconViewModel[] = [];
    
        for (let blob of blobs) {
          let vm: IconViewModel = new IconViewModel();
    
          vm.Type = blob.Type;
          vm.Name = blob.Name.substring(blob.Name.indexOf('/') + 1, blob.Name.length);
          vm.Url = blob.Url;
          vm.Parent = blob.Parent;
    
          viewModels.push(vm);
        }
    
        return viewModels;
      }
}