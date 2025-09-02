import Base from "models/Base";
import ListItem from "models/ListItem";

export default class PropertyItem
    extends Base {
    constructor({id, name, code, type, userType, isMultiple, isRequired, listValues, info}) {
        super();

        this.isConsist           = code === 'CONSIST';
        this.isVideo             = code === 'VIDEO';
        this.isProductionMinutes = code === 'PRODUCTION_MINUTES';
        this.isColor             = code === 'color';
        this.isProductSearch     = code === 'complete';

        this.isCustom = this.isConsist || this.isVideo || this.isProductionMinutes || this.isColor || this.productSearch;

        if (listValues.length === 1) {
            listValues.push({
                id: false,
                name: 'Нет',
            });
        }

        this.id         = id;
        this.name       = name;
        this.code       = code;
        this.listValues = ListItem.createFromArray(listValues);
        this.isMultiple = isMultiple;
        this.isRequired = isRequired;
        this.isFile     = !this.isCustom && type === 'F';
        this.isString   = !this.isCustom && type === 'S' && userType === '';
        this.isNumber   = !this.isCustom && type === 'N';
        this.isList     = !this.isCustom && (type === 'L' || type === 'E');
        this.isDate     = !this.isCustom && type === 'S' && userType === 'Date';
        this.isText     = !this.isCustom && type === 'S' && userType === 'HTML';

        this.block = info.block;
        this.type = info.type || 'base';
    }
}