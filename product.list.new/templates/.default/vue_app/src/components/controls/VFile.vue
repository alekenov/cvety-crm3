<template>
    <div class="files-container">
        <div class="file-items-container">
            <div
                class="file-item"
                v-for="(fileItem, index) in actualFiles"
                :key="index"
            >
                <span class="file-item__name">{{fileItem.name}}</span>
                <span class="file-item__remove" @click="removeFile(fileItem.id)"></span>
            </div>
        </div>

        <label>
            <input
                v-show="false"
                type="file"
                class="input-file"
                :multiple="multiple"
                @change="onChange"
            />
            {{placeholder}}
        </label>
    </div>
</template>

<script>
    import FileItem from "models/FileItem";

    export default {
        name     : "VFile",
        props    : {
            value    : {
                type    : Array,
                default : () => [],
            },
            placeholder: {
                type: String,
                default: 'Выберите файл на своём устройстве'
            },
            multiple : {
                type    : Boolean,
                default : false,
            },
        },
        model    : {
            event : 'change',
            prop  : 'value',
        },
        data() {
            return {
                index : -1,
            };
        },
        computed : {
            actualFiles() {
                return this.value.filter((file) => file.isDeleted === false);
            },
        },
        methods  : {
            getNewIndex() {
                return this.index--;
            },
            onChange(e) {
                const arFiles = Array.apply('map', e.target.files);

                let files = arFiles.map((file) => {
                    return FileItem.createFrom({
                        id        : this.getNewIndex(),
                        name      : file.name,
                        file      : file,
                        isNew     : true,
                        isDeleted : false,
                    });
                });

                if (this.multiple) {
                    files = [...this.value, ...files];
                }

                this.emitChange(files);

                e.target.value = '';
            },
            removeFile(id) {
                const newFiles = this.value.reduce((carry, file) => {
                    if (id < 0 && id === file.id) {
                        return carry;
                    }

                    carry.push(FileItem.createFrom({
                        id        : file.id,
                        name      : file.name,
                        file      : file.file,
                        isNew     : file.isNew,
                        isDeleted : file.id === id ? true : file.isDeleted,
                    }));

                    return carry;
                }, []);

                this.emitChange(newFiles);
            },
            emitChange(files) {
                this.$emit('change', files);
            },
        },
    };
</script>