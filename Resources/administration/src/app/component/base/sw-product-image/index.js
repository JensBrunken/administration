import { Component, Filter } from 'src/core/shopware';
import template from './sw-product-image.html.twig';
import './sw-product-image.less';

/**
 * @public
 * @description Component which renders an image.
 * @status ready
 * @example-type code-only
 * @component-example
 * <sw-image :item="item" isCover="true"></sw-image>
 */
Component.register('sw-product-image', {
    template,

    props: {
        item: {
            type: Object,
            required: true
        },

        isCover: {
            type: Boolean,
            required: false,
            default: false
        },

        isPlaceholder: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    computed: {
        productImageClasses() {
            return {
                'is--placeholder': this.isPlaceholder,
                'is--cover': this.isCover
            };
        },

        mediaNameFilter() {
            return Filter.getByName('mediaName');
        }
    }
});
