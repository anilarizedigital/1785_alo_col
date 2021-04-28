define([
    'core/js/adapt',
    'core/js/models/itemsComponentModel',
    './submenuView'
], function(Adapt, ItemsComponentModel, SubmenuView) {

    return Adapt.register('submenu', {
        model: ItemsComponentModel,
        view: SubmenuView
    });
});
