import Base from 'models/Base';

export default class PageNav
    extends Base {
    constructor({total, limit, offset}) {
        super({});
        this.limit = limit;
        this.total = total;
        this.offset = offset;
    }
}