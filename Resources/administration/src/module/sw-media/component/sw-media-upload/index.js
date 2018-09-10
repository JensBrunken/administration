import { Component, State } from 'src/core/shopware';
import { fileReader } from 'src/core/service/util.service';
import template from './sw-media-upload.html.twig';
import './sw-media-upload.less';

Component.register('sw-media-upload', {
    template,

    inject: ['mediaService'],

    props: {
        catalogId: {
            required: true,
            type: String
        }
    },

    computed: {
        mediaItemStore() {
            return State.getStore('media');
        }
    },

    methods: {
        onClickUpload() {
            this.$refs.fileInput.click();
        },

        onFileInputChange() {
            const newMediaFiles = Array.from(this.$refs.fileInput.files);
            const uploads = newMediaFiles.map(this.addMediaEntityFromFile);

            Promise.all(uploads).then(() => {
                this.$emit('new-media-entity');
            });
        },

        addMediaEntityFromFile(file) {
            return fileReader.readAsDataURL(file).then(() => {
                const mediaEntity = this.mediaItemStore.create();

                mediaEntity.name = file.name;
                mediaEntity.catalogId = this.catalogId;

                return mediaEntity.save().then(() => {
                    return fileReader.readAsArrayBuffer(file).then((buffer) => {
                        return this.mediaService.uploadMediaById(
                            mediaEntity.id,
                            file.type,
                            buffer,
                            file.name.split('.').pop()
                        );
                    });
                }).catch(() => {
                    mediaEntity.delete(true);
                });
            });
        }
    }
});
