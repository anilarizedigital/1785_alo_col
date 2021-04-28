define([
    'core/js/adapt',
    'core/js/models/itemsComponentModel',
    './hotmenuView'
], function(Adapt, ItemsComponentModel, HotmenuView) {

    return Adapt.register('hotmenu', {
        model: ItemsComponentModel,
        view: HotmenuView
    });
});
