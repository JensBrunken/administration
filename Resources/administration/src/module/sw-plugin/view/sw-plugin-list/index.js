import { Component, Mixin, State } from 'src/core/shopware';
import template from './sw-plugin-list.html.twig';
import './sw-plugin-list.scss';

Component.register('sw-plugin-list', {
    template,

    props: {
        searchTerm: {
            type: String,
            required: false
        }
    },

    inject: ['pluginService', 'systemConfigApiService', 'context'],

    mixins: [
        Mixin.getByName('listing'),
        Mixin.getByName('notification')
    ],

    data() {
        return {
            limit: 25,
            plugins: [],
            isLoading: false,
            sortBy: 'upgradedAt',
            sortDirection: 'desc',
            sortType: 'upgradedAt:desc'
        };
    },

    mounted() {
        this.mountedComponent();
    },

    computed: {
        pluginsStore() {
            return State.getStore('plugin');
        },

        showPagination() {
            return (this.total >= 25);
        },

        currentLocale() {
            return this.$store.state.adminLocale.currentLocale;
        },
        languageId() {
            return this.$store.state.adminLocale.languageId;
        }
    },

    watch: {
        currentLocale() {
            this.getList();
        },

        searchTerm() {
            this.onSearch(this.searchTerm);
        },
        languageId() {
            this.getList();
        }
    },

    methods: {
        mountedComponent() {
            this.$root.$on('sw-plugin-force-refresh', () => {
                this.getList();
            });
        },

        changeActiveState(plugin) {
            if (!plugin.active) {
                this.pluginService.deactivate(plugin.name).then(() => {
                    this.createNotificationSuccess({
                        title: this.$tc('sw-plugin.list.titleDeactivateSuccess'),
                        message: this.$tc('sw-plugin.list.messageDeactivateSuccess')
                    });
                    this.getList();
                });
            } else {
                this.pluginService.activate(plugin.name).then(() => {
                    this.createNotificationSuccess({
                        title: this.$tc('sw-plugin.list.titleActivateSuccess'),
                        message: this.$tc('sw-plugin.list.messageActivateSuccess')
                    });
                    this.getList();
                });
            }
        },

        onInstallPlugin(plugin) {
            this.pluginService.install(plugin.name).then(() => {
                this.createNotificationSuccess({
                    title: this.$tc('sw-plugin.list.titleInstallSuccess'),
                    message: this.$tc('sw-plugin.list.messageInstallSuccess')
                });
                this.getList();
            });
        },

        onUninstallPlugin(plugin) {
            this.pluginService.uninstall(plugin.name).then(() => {
                this.createNotificationSuccess({
                    title: this.$tc('sw-plugin.list.titleUninstallSuccess'),
                    message: this.$tc('sw-plugin.list.messageUninstallSuccess')
                });
                this.getList();
            });
        },

        onUpdatePlugin(plugin) {
            this.pluginService.update(plugin.name).then(() => {
                this.createNotificationSuccess({
                    title: this.$tc('sw-plugin.list.titleUpdateSuccess'),
                    message: this.$tc('sw-plugin.list.messageUpdateSuccess')
                });
                this.getList();
            });
        },

        onDeletePlugin(plugin) {
            this.pluginService.delete(plugin.name).then(() => {
                this.createNotificationSuccess({
                    title: this.$tc('sw-plugin.list.titleDeleteSuccess'),
                    message: this.$tc('sw-plugin.list.messageDeleteSuccess')
                });
                this.getList();
                this.$root.$emit('sw-plugin-refresh-updates');
            });
        },

        onPluginSettings(plugin) {
            this.$router.push({ name: 'sw.plugin.settings', params: { namespace: plugin.name } });
        },

        successfulUpload() {
            this.getList();
        },

        getList() {
            this.isLoading = true;

            const params = this.getListingParams();

            this.pluginsStore.getList(params, false, this.$store.state.adminLocale.languageId).then((response) => {
                this.plugins = response.items;
                this.isConfigAvailableForPlugins();
                this.total = response.total;
                this.isLoading = false;
            });
        },

        getListingParams() {
            return {
                limit: this.limit,
                page: this.page,
                sortBy: this.sortBy,
                sortDirection: this.sortDirection,
                term: this.term
            };
        },

        sortPluginList(event) {
            this.sortType = event;
            const sorting = this.sortType.split(':');
            this.sortBy = sorting[0];
            this.sortDirection = sorting[1];
            this.page = 1;
            this.updateRoute({
                sortBy: this.sortBy,
                sortDirection: this.sortDirection,
                page: this.page
            });
            this.getList();
        },

        isConfigAvailableForPlugins() {
            this.plugins.forEach((plugin) => {
                if (!plugin.active) {
                    return;
                }

                this.systemConfigApiService.checkConfig(`${plugin.name}.config`).then((response) => {
                    plugin.customFields = {
                        configAvailable: response
                    };
                }).catch(() => {
                    plugin.customFields = {
                        configAvailable: false
                    };
                });
            });
        }
    }
});
