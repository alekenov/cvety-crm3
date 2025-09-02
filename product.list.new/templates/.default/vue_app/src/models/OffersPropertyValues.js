import store from 'store';
import FileItem from "models/FileItem";
import {isArray} from "services/Utils";

const getters = store.getters;

export default class OffersPropertyValues {
    constructor(values) {
        values = values || {};

        for (let i in getters.allOffersProps) {
            const prop = getters.allOffersProps[i];

            let value = values[prop.id] || '';

            if (!value) {
                if (prop.isMultiple || prop.isFile || prop.isConsist) {
                    value = [];
                }
                else if (prop.isVideo) {
                    value = FileItem.createFrom({
                        id    : 0,
                        isNew : true,
                    });
                }
                else {
                    value = '';
                }
            }
            else if (prop.isVideo) {
                value = FileItem.createFrom({
                    id        : value.id,
                    name      : value.name,
                    src       : value.src,
                    isNew     : false,
                    isDeleted : false,
                });
            }
            else if (prop.isFile) {
                if (!prop.isMultiple && !isArray(value)) {
                    value = [value];
                }

                value = FileItem.createFromArray(value);
            }

            this[prop.id] = value;
        }
    }
}