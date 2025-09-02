<template>
    <div class="form-group">
        <div
            v-for="(item, index) in actualFiles"
            class="form-group__photo with-background"
            :key="index"
            :style="getStyle(index)"
        >
            <span
                class="form-group__photo-remove new-close"
                @click.stop="onRemove(item.id)"
            ></span>
        </div>

        <div class="form-group__photo with-background" @click="clickHandler" v-if="multiple || value.length === 0"></div>

        <input
            v-show="false"
            type="file"
            accept="image/x-png,image/jpeg"
            ref="fileInput"
            :multiple="multiple"
            @change="onChange"
        />
    </div>
</template>

<script>
    import FileItem from "models/FileItem";
    import {getFileSrc} from "services/Utils";

    export default {
        name    : "VImage",
        props   : {
            multiple : {
                type    : Boolean,
                default : false,
            },
            value    : {
                type : Array,
            },
        },
        model: {
            prop: 'value',
            event: 'change',
        },
        data() {
            return {
                index: -1,
            };
        },
        computed : {
            actualFiles() {
                return this.value.filter((file) => file.isDeleted === false);
            },
        },
        methods : {
            getStyle(index) {
                let file = this.actualFiles[index];
                if (!file.src) {
                    return {};
                }

                return {backgroundImage : "url('" + file.src + "')", backgroundSize: 'contain'};
            },
            getNewIndex() {
                return this.index--;
            },
            async onChange(e) {
                const arFiles = Array.apply('map', e.target.files);

                let files = [];
                for (let i = 0; i < arFiles.length; i++) {
                    let file = arFiles[i];
                    files.push({
                        id        : this.getNewIndex(),
                        name      : file.name,
                        src       : await getFileSrc(file),
                        file      : file,
                        isNew     : true,
                        isDeleted : false,
                    });
                }

                if (this.multiple) {
                    files = [...this.value, ...files];
                }

                this.emitChange(files);

                e.target.value = '';
            },
            onRemove(id) {
                const newFiles = this.value.reduce((carry, file) => {
                    if (id < 0 && id === file.id) {
                        return carry;
                    }

                    carry.push(FileItem.createFrom({
                        id        : file.id,
                        name      : file.name,
                        src       : file.src,
                        file      : file.file,
                        isNew     : file.isNew,
                        isDeleted : file.id === id ? true : file.isDeleted,
                    }));

                    return carry;
                }, []);

                this.emitChange(newFiles);
            },
            emitChange(value) {
                this.$emit('change', value);
            },
            clickHandler() {
                this.$refs.fileInput.click();
            },
        },
    };
</script>