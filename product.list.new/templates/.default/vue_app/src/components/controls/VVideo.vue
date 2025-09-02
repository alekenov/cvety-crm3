<template>
    <div class="video-input-container">
        <div class="form-group" v-if="hasName">
            <div class="form-group__label">Видео</div>
            <div class="filename-wrapper" >
                <span class="fake-filename">{{name}}</span>
                <span class="video-icon change-icon" title="Заменить" @click="openFileDialog"></span>
                <span class="video-icon remove-icon" title="Удалить" @click="removeFile"></span>
            </div>
        </div>
        <span class="upload-video-icon" @click="openFileDialog" v-else>+ Добавить видео о товаре</span>
        <span v-if="!hasName">Максимальная длительность видео 15 секунд</span>
        <input
            v-show="false"
            type="file"
            accept="video/mp4"
            ref="file"
            @change="onChange"
        >
    </div>
</template>

<script>
    import FileItem from "models/FileItem";

    export default {
        name : "VVideo",
        props: {
            value: {
                type: FileItem,
            }
        },
        model: {
            event: 'change',
            prop: 'value'
        },
        computed: {
            hasName: function() {
                return this.value?.isDeleted === false && this.name;
            },
            name() {
                return this.value?.name;
            },
        },
        methods: {
            onChange(e) {
                const file = e.target.files[0];

                const fileItem = FileItem.createFrom({
                    id        : -1,
                    name      : file.name,
                    file      : file,
                    isNew     : true,
                    isDeleted : false,
                });
                this.emitChange(fileItem);

                e.target.value = '';
            },
            openFileDialog() {
                this.$refs.file.click();
            },
            removeFile() {
                if (this.value.isDeleted === true) {
                    return;
                }
                let cloned = FileItem.createFrom(this.value);
                cloned.isDeleted = true;

                this.emitChange(cloned);
            },
            emitChange(value) {
                this.$emit('change', value);
            }
        }
    }
</script>