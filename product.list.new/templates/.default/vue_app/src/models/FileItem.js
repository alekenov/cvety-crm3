import Base from 'models/Base';

export default class FileItem
    extends Base {

    constructor({
        id = 0,
        name = '',
        file = null,
        src = '',
        isNew = false,
        isDeleted = false,
    } = {}) {
        super({});

        this.id        = id;
        this.name      = name;
        this.file      = file;
        this.src       = src;
        this.isNew     = isNew === undefined ? false : isNew;
        this.isDeleted = isDeleted === undefined ? false : isDeleted;
    }
}