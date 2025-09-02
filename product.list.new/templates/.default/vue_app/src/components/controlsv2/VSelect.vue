<template>
    <div class="input-label-transform__input-container select-wrapper">
        <v-select-old
            v-if="isSelectOld"
            :options="options"
            :value="value"
            :placeholder="''"
            :searchable="searchable"
            :multiple="multiple"
            :close-on-select="closeOnSelect"
            :hide-selected="multiple"
            @select="onSelect"
            @open="onOpen"
            @close="onClose"
        />
        <v-tags
            v-else-if="isTags"
            :options="options"
            :value="value"
            :placeholder="placeholder"
            @select="onSelect"
        />
        <v-select-native
            v-else-if="isSingleSelect"
            :value="value"
            :options="options"
            @select="onSelect"
            @focus="onOpen"
            @blur="onClose"
        />
        <label :class="labelClassWrapper">{{placeholder}}</label>
    </div>
</template>

<script>

import {default as VSelectOld} from "@/components/controls/VSelect";
import VSelectNative from "@/components/controlsv2/VSelectNative";
import VTags from "@/components/controlsv2/VTags";

export default {
    name : "VSelect",
    components: {
        VSelectNative,
        VSelectOld,
        VTags,
    },
    props      : {
        options       : {
            type    : Array,
            default : () => [],
        },
        value         : {
            type : [
                Number,
                String,
                Boolean,
                Array,
            ],
        },
        placeholder   : {
            type    : String,
            default : 'Выберите значение'
        },
        multiple      : {
            type    : Boolean,
            default : false,
        },
        searchable    : {
            type    : Boolean,
            default : false,
        },
        closeOnSelect : {
            type    : Boolean,
            default : true,
        },
        type          : {
            type    : String,
            default : 'base',
        },
    },
    model      : {
        prop  : 'value',
        event : 'select',
    },
    data() {
        return {
            isOpened: false,
        };
    },
    computed : {
        hasValue() {
            return this.multiple ? this.value.length > 0 : this.value;
        },
        labelClassWrapper() {
            return {
                'hidden'                                : this.isTags,
                'input-label-transform__label'          : true,
                'input-label-transform__label--focused' : this.hasValue || this.isOpened,
                'vue-multiselect'                       : this.isSelectOld,
            };
        },
        isSelectOld() {
            return this.multiple && this.type === 'base' || this.type === 'old';
        },
        isTags() {
            return this.multiple && this.type === 'tags';
        },
        isSingleSelect() {
            return !this.multiple;
        },
    },
    methods : {
        onSelect(value) {
            this.$emit('select', value);
        },
        onOpen() {
            this.isOpened = true;
        },
        onClose() {
            this.isOpened = false;
        },
    }
}
</script>