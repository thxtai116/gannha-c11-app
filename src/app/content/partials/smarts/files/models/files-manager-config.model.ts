import { FilesConfigModel } from './files-config.model';

export class FilesManagerConfigModel extends FilesConfigModel {
    Buttons: string[] = ['*'];

    Limitted: number = 0;

    IncludeHidden: boolean = false;
}