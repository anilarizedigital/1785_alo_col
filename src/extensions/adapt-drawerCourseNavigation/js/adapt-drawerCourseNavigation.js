define([
    'backbone',
    'coreJS/adapt',
    './adapt-drawerCourseNavigationView'
], function(Backbone, Adapt, DrawerCourseNavigationView) {

    function setupMenu(drawerCourseNavigationModel, drawerCourseNavigationItems) {
        var pageId = undefined;
        Adapt.on("pageView:postRender", function(pageView) {
            pageId = pageView.model.get('_id');
        });
        var drawerCourseNavigationCollection = new Backbone.Collection(drawerCourseNavigationItems);
        var drawerCourseNavigationModel = new Backbone.Model(drawerCourseNavigationModel);

        Adapt.on('drawerCourseNavigation:showDrawerCourseNavigation', function() {
            Adapt.drawer.triggerCustomView(new DrawerCourseNavigationView({
                model: drawerCourseNavigationModel,
                collection: drawerCourseNavigationCollection
            }).$el);
        });
    }

    Adapt.once('app:dataReady', function() {
        var drawerCourseNavigationData = Adapt.course.get('_drawerCourseNavigation');
        //var drawerCourseNavigationItems = Adapt.contentObjects.models;
        var drawerCourseNavigationItems = drawerCourseNavigationData._courseNavigation;
        
        if (!drawerCourseNavigationItems || drawerCourseNavigationData._isEnabled === false) return;

        var drawerObject = {
            title: drawerCourseNavigationData.title,
            description: drawerCourseNavigationData.description,
            className: 'courseNavigation-drawer'
        };
        // Syntax for adding a Drawer item
        // Adapt.drawer.addItem([object], [callbackEvent]);
        Adapt.drawer.addItem(drawerObject, 'drawerCourseNavigation:showDrawerCourseNavigation');

        setupMenu(drawerCourseNavigationData, drawerCourseNavigationItems);
    });
});
