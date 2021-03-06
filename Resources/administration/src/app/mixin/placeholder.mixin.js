import { Mixin, State } from 'src/core/shopware';

Mixin.register('placeholder', {
    computed: {
        languageStore() {
            return State.getStore('language');
        }
    },

    methods: {
        placeholder(entity, field, fallbackSnippet) {
            if (!entity) {
                return fallbackSnippet;
            }

            // Return the field from parent translation if set
            const parentLanguageId = this.languageStore.getCurrentLanguage().parentId;
            if (parentLanguageId && parentLanguageId.length > 0 && entity.translations) {
                const translation = entity.translations.find((entry) => {
                    return entry.id === `${entity.id}-${parentLanguageId}`;
                });

                if (translation && translation[field] && translation[field].length > 0) {
                    return translation[field];
                }
            }
            // Return the field from translated if set
            if (entity.translated != null && entity.translated.hasOwnProperty(field)) {
                if (entity.translated[field] !== null) {
                    return entity.translated[field];
                }
            }

            // Return the placeholder snippet
            return fallbackSnippet;
        }
    }
});
