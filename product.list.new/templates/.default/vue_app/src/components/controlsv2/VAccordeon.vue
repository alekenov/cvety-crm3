<template>
    <div class="panel-categories-options-item without-border">
        <div
            :class="placeholderClassWrapper"
            @click="toggle"
        >
            <div class="panel__subtitle">{{placeholder}}</div>
            <div class="panel-categories-options-title__dropdown-wrap">
                <img src="/local/templates/cvety.crm/images/chevron-down-grey.svg">
            </div>
        </div>
        <div :class="slideToggleClassWrapper">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name     : "VAccordeon",
    props    : {
        placeholder : {
            type    : String,
            default : 'Название',
        }
    },
    data() {
        return {
            isActive : true,
        };
    },
    computed : {
        placeholderClassWrapper() {
            return {
                'active'                         : this.isActive,
                'panel-categories-options-title' : true,
            };
        },
        slideToggleClassWrapper() {
            return {
                'hidden'              : !this.isActive,
                'slidetoggle-content' : true,
            }
        },
    },
    methods  : {
        toggle() {
            this.isActive = !this.isActive;
        },
    },
}
</script>