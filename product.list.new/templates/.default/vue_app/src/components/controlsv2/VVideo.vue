<template>
    <div
        :class="containerClassWrapper"
        @click="openFileDialogForAdd"
    >
        <div class="form-group__video-aside" v-if="!hasName">
            <div class="form-group__video-icon"></div>
        </div>
        <div class="form-group__video-body" v-if="!hasName">
            <div class="form-group__file-text">Добавьте видео товара</div>
            <div class="form-group__file-note">Не более 15 секунд.</div>
        </div>

        <div class="form-group__file-video-uploaded-text" v-if="hasName">
            <div class="form-group__video-icon"></div>
            <div class="form-group__file-text">{{name}}</div>
        </div>
        <div class="form-group__file-video-uploaded-controls" v-if="hasName">
            <div class="form-group__file-video-uploaded-controls-item">
                <span
                    class="button-link"
                    @click="openFileDialog"
                >Изменить</span>
            </div>
            <div class="form-group__file-video-uploaded-controls-item">
                <span
                    class="button-link"
                    @click.stop="removeFile"
                >Удалить</span>
            </div>
        </div>

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
    import FileItem from "@/models/FileItem";

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
            containerClassWrapper() {
                return {
                    'form-group__file'                 : true,
                    'form-group__file--video'          : !this.hasName,
                    'form-group__file--video-uploaded' : this.hasName,
                };
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
            openFileDialogForAdd() {
                if (!this.hasName) {
                    this.openFileDialog();
                }
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