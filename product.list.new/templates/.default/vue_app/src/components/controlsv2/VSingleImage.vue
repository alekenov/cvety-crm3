<template>
    <div class="panel-form-row">
        <div
            v-if="isEmpty"
            class="form-group__file form-group__file--photo"
            @click="showFileUploadNativeModal"
        >
            <div class="form-group__photo-icon"></div>
            <div class="form-group__file-text">Добавьте фотографию товара *</div>
            <div class="form-group__file-note">Форматы jpg, jpeg, png.</div>
        </div>

        <div
            v-else
            class="uploaded-file"
        >
            <img :src="value.src">
            <div class="uploaded-file__controls">
                <div class="uploaded-file__controls-item">
                    <button
                        class="btn btn_lowercase"
                        @click="showFileUploadNativeModal"
                    >Изменить</button>
                </div>
                <div class="uploaded-file__controls-item">
                    <button
                        class="btn btn_lowercase"
                        @click="remove"
                    >
                        <span class="text-red">Удалить</span>
                    </button>
                </div>
            </div>
        </div>

        <input
            v-show="false"
            type="file"
            accept="image/x-png,image/jpeg"
            ref="fileInput"
            @change="onChange"
        />
    </div>
</template>

<script>
import FileItem from "@/models/FileItem";
import {getFileSrc} from "@/services/Utils";

export default {
    name  : "VSingleImage",
    props : {
        value : {
            type    : Object,
            default : () => {
                return new FileItem();
            },
        },
    },
    model : {
        event : 'change',
        prop  : 'value',
    },
    data() {
        return {};
    },
    computed : {
        isEmpty() {
            return this.value.isDeleted || !this.value.id && !this.value.file;
        },
    },
    methods  : {
        onChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.setFile(file);
            }

            e.target.value = '';
        },
        async setFile(file) {
            this.emitChange(new FileItem({
                src       : await getFileSrc(file),
                file,
                name      : file.name,
                isNew     : true,
                isDeleted : false,
            }));
        },
        remove() {
            this.emitChange(new FileItem({
                id        : this.value?.id || 0,
                src       : '',
                file      : null,
                name      : '',
                isNew     : false,
                isDeleted : true,
            }));
        },
        emitChange(fileItem) {
            this.$emit('change', fileItem);
        },
        getClonedValue() {
            return new FileItem({
                id        : this.value.id || 0,
                name      : this.value.name || '',
                file      : this.value.file || null,
                src       : this.value.src || '',
                isNew     : this.value.isNew,
                isDeleted : this.value.isDeleted,
            });
        },
        showFileUploadNativeModal() {
            this.$refs.fileInput.click();
        },
    },
}
</script>