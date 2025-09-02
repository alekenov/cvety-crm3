<template>
    <div>
        <v-date-multi
            v-if="multiple"
            :values="value"
            @input="onInput"
        />
        <v-date
            v-else
            :value="value"
            @input="onInput"
        />
        <v-button
            v-if="multiple"
            @click="addMultiValue"
        >Добавить</v-button>
    </div>
</template>

<script>
    import VDate from "components/controls/VDate";
    import VDateMulti from "components/controls/VDateMulti";
    import VButton from "components/controls/VButton";
    import IPropertyMixin from "mixins/IPropertyMixin";

    export default {
        name : "IDate",
        components : {
            VButton,
            VDate,
            VDateMulti,
        },
        mixins: [IPropertyMixin],
    };
</script>