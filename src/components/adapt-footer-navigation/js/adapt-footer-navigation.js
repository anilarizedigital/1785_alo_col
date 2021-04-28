define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var FooterNavigation = ComponentView.extend({
        events: {
            //'inview': 'onInview',
            'click .footer-navigation-button': 'onNavButtonClick'
        },

        preRender: function() {
            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.setReadyStatus();
            this.$('.component-inner').on('inview', _.bind(this.inview, this));
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');
            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        onNavButtonClick: function(e) {
            console.log($(e.currentTarget).data("action"), ', ');
            var launchID = $(e.currentTarget).data("action");
            
            if(launchID)
                Backbone.history.navigate('#/id/' + launchID, {trigger: true});
            else
                Backbone.history.navigate('#/');
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY=="top") {
                    this.$('.component-inner').off('inview');
                    this.setCompletionStatus();
                }
            }
        }

    });

    Adapt.register('footer-navigation', FooterNavigation);

    return FooterNavigation;

});
