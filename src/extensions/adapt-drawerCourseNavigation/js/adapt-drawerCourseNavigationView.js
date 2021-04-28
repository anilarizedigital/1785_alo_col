define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var DrawerCourseNavigationView = Backbone.View.extend({

        className: "drawerCourseNavigation",

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(Adapt, 'pageView:postRender', this.selectCurrentItem);
            this.render();
            this.selectCurrentItem();
        },

        events: {
            'click .drawerCourseNavigation-item button': 'onDrawerItemClicked'
        },

        render: function() {
            var collectionData = this.collection.toJSON();
            var modelData = this.model.toJSON();
            var template = Handlebars.templates["drawerCourseNavigation"];
            console.log('render collectionData - ', collectionData, '\n modelData - ', modelData);
            this.$el.html(template({model: modelData, resources: collectionData, _globals: Adapt.course.get('_globals')}));
            _.defer(_.bind(this.postRender, this));
            return this;
        },

        postRender: function() {
            this.listenTo(Adapt, 'drawer:triggerCustomView', this.remove);
        },

        selectCurrentItem: function(pageView) {
            var currentId = Adapt.location._currentId;
            this.$('.drawerCourseNavigation-item-menu').removeClass('selected');
            this.$('.drawerCourseNavigation-item-submenu').hide().removeClass('selected');
            this.$('.drawer-item-'+currentId).siblings('.drawerCourseNavigation-item-menu').addClass('selected');
            this.$('.drawer-item-'+currentId).show().addClass('selected').siblings().show();
        },

        onDrawerItemClicked: function(event) {
            //this.$('.drawerCourseNavigation-item-menu').find('button').removeClass('active');
            if(event && event.preventDefault) event.preventDefault();
            if(this.model.get('_isLocked')) return;

            var target = $(event.currentTarget),
                isMenu = target.parent().hasClass('drawerCourseNavigation-item-menu'),
                isSubmenu = target.parent().siblings().hasClass('drawerCourseNavigation-item-submenu');

            console.log(target.data("isactive"));
            if(target.data("isactive") == false) {
                return false;
            }
            
            if(isSubmenu == true) {
                target.parent().siblings().slideToggle( 400, function() {
                    // Animation complete.
                });
            }
            if(target.data("href") != undefined) {
                if(target.data("href") == "#") {
                    Backbone.history.navigate('#/', {trigger: true});
                } else {
                    Backbone.history.navigate('#/id/' + target.data("href"), {trigger: true});
                }
            }
            
            if(target.parent().hasClass('selected'))
                return;
            
            if(target.parent().hasClass('active'))
                target.parent().removeClass('active');
            else
                target.parent().addClass('active');
        }
    });

    return DrawerCourseNavigationView;
})
