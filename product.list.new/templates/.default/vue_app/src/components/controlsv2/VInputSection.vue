<template>
    <div class="panel-form-row">
        <div class="input-label-transform__input-container">
            <div class="input-label-transform">{{sectionName}}</div>
            <label
                class="input-label-transform__label"
                :class="{'input-label-transform__label--focused': sectionName}"
            >Категория</label>
            <a
                href="#show-section-popup"
                style="position: absolute;right: 0;top: 8px;"
                @click.prevent="$emit('change')"
            >Изменить</a>
        </div>
    </div>
</template>

<script>

import {mapGetters} from 'vuex';
import {getSectionName} from "@/services/Utils";

export default {
    name : "VInputSection",
    props: {
        sectionId: {
            type: [String, Number],
            default: '',
        },
    },
    computed : {
        ...mapGetters([
            'sectionsMap',
        ]),
        sectionName() {
            return getSectionName(this.sectionId, this.sectionsMap);
        },
    },
}
</script>