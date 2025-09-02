<template>
    <div class="search-filter-dropdown__body-row search-filter-dropdown__body-row--with-border">
        <div class="search-filter-dropdown__body-row-title">{{title}}</div>
        <div
            v-for="item in options"
            class="search-filter-dropdown-form-row"
            :key="item.id"
        >
            <div class="search-filter-dropdown-form-row__text">{{item.name}}</div>
            <div class="search-filter-dropdown-form-row__choice">
                <v-checkbox
                    :checked="isSelected(item)"
                    @input="onChange({checked: $event, id: item.id})"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VCheckbox from "@/components/controls/VCheckbox";

export default {
    name       : "VCheckboxMultiNew",
    components : {
        VCheckbox,
    },
    props      : {
        value   : {
            type    : Array,
            default : () => [],
        },
        options : {
            type    : Array,
            default : () => [],
        },
        title   : {
            type   : String,
            default: 'Тип товара',
        }
    },
    model      : {
        event : 'select',
        prop  : 'value',
    },
    methods    : {
        isSelected({id}) {
            return this.value.includes(id);
        },
        onChange({checked, id}) {
            let newValue = this.value.filter(value => value !== id);

            if (checked) {
                newValue.push(id);
            }

            this.$emit('select', newValue);
        }
    }
}
</script>