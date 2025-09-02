import Base from "models/Base";
import PropertyItem from "models/PropertyItem";

export default class SectionItem
    extends Base {
    constructor({id, name, image, parentId, isPopular, isAdditional, hasChild, properties, offersProperties}) {
        super();
        this.id           = id;
        this.name         = name;
        this.image        = image;
        this.parentId     = parentId;
        this.isPopular    = isPopular;
        this.isAdditional = isAdditional;
        this.hasChild     = hasChild;
        this.parentId     = parentId;
        this.properties   = PropertyItem.createFromArray(properties);
        this.offersProperties = offersProperties ? PropertyItem.createFromArray(offersProperties) : [];
    }
}