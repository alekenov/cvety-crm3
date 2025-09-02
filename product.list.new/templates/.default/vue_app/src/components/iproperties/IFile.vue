<template>
    <v-file
        :value="value"
        :multiple="multiple"
        :placeholder="placeholder"
        @change="onChange"
    />
</template>

<script>
    import VFile from "components/controls/VFile";

    export default {
        name       : "IFile",
        components : {
            VFile,
        },
        props      : {
            value    : {
                type    : Array,
                default : () => [],
            },
            multiple : {
                type    : Boolean,
                default : false,
            },
            placeholder: {
                type: String,
                default: '',
            }
        },
        model      : {
            prop  : 'value',
            event : 'change',
        },
        methods    : {
            onChange(value) {
                this.$emit('change', value);
            },
        },
    };
</script>