<template>
    <div class="panel-form-row" style="margin-bottom: 12px;">
        <div
            v-if="isEmpty"
            class="form-group__file form-group__file--photo"
            @click="clickHandler"
        >
            <div class="form-group__photo-icon"></div>
            <div v-if="multiple" class="form-group__file-text">
                Добавьте фотографии товара
            </div>
            <div v-else class="form-group__file-text">
                Добавьте фотографию товара
            </div>
            <div v-if="multiple" class="form-group__file-note">
                Не более {{limit}} фото, jpg, jpeg, png.
            </div>
            <div v-else class="form-group__file-note">
                jpg, jpeg, png.
            </div>
        </div>

        <div
            v-else
            class="form-group__file-grid"
        >
            <div
                class="form-group__file-grid-item"
                v-if="!isLimit"
            >
                <button
                    class="form-group__file-grid-item-add"
                    type="button"
                    @click.prevent="clickHandler"
                >
                </button>
            </div>
            <div
                class="form-group__file-grid-item"
                v-for="(item, index) in actualFiles"
                :key="index"
            >
                <img :src="item.src" alt="">
                <button
                    class="form-group__file-grid-item-remove"
                    type="button"
                    @click.stop="onRemove(item.id)"
                >
                    <div class="form-group__item-remove-icon"></div>
                </button>
            </div>
        </div>

        <input
            v-show="false"
            type="file"
            accept="image/*"
            ref="fileInput"
            :capture="capture"
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
            capture: {
                type: [String, Boolean],
                default: false
            }
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
            length() {
                return this.actualFiles.length;
            },
            hasFiles() {
                return this.length > 0;
            },
            isEmpty() {
                return !this.hasFiles;
            },
            limit() {
                return this.multiple ? 10 : 1;
            },
            isLimit() {
                return this.length === this.limit;
            },
        },
        methods : {
            getNewIndex() {
                return this.index--;
            },
            async onChange(e) {
                const arFiles = Array.apply('map', e.target.files);

                let files = [];
                for (let i = 0; i < arFiles.length; i++) {
                    if (this.length + i >= this.limit) {
                        break;
                    }

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