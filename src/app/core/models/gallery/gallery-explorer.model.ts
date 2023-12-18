import { GalleryBaseModel } from './gallery-base.model';

export class GalleryExplorerModel extends GalleryBaseModel {
    Privacy: number = 0;

    ResourceType: string = "";

    Path: string = "";

    Url: string = "";

    Thumbnail: string = "";

    Selected: boolean = false;

    ParentId: number = 0;

    Childs: GalleryExplorerModel[] = [];
}