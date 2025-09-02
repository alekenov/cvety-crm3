import Base from "models/Base";

export default class ListItem
    extends Base {
    constructor({id, name, color, isDefault}) {
        super({});
        this.id        = id;
        this.name      = name;
        this.color     = color;
        this.isDefault = isDefault;
    }
}