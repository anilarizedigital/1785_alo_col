define([
    'core/js/adapt',
    'core/js/views/componentView',
    'extensions/adapt-contrib-pageLevelProgress/js/completionCalculations',
], function(Adapt, ComponentView, CompletionCalculation) {

    var SubmenuView = ComponentView.extend({

        events: {
            'click .submenu-grid-item': 'onItemClicked'
        },

        initialize: function() {
            ComponentView.prototype.initialize.call(this);
            this.setDeviceSize();
            this.setUpViewData();
            this.setUpModelData();
            this.setUpEventListeners();
            this.checkIfResetOnRevisit();
        },

        setUpViewData: function() {
            this.popupView = null;
            this._isPopupOpen = false;
        },

        setUpModelData: function() {
            if (this.model.get('_canCycleThroughPagination') === undefined) {
                this.model.set('_canCycleThroughPagination', false);
            }
        },

        setUpEventListeners: function() {
            this.listenTo(Adapt, 'device:changed', this.resizeControl);

            this.listenTo(this.model.get('_children'), {
                'change:_isActive': this.onItemsActiveChange,
                'change:_isVisited': this.onItemsVisitedChange
            });
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false)
            }
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) this.model.reset(isResetOnRevisit);
        },

        postRender: function() {
            this.setUpColumns();
            this.$('.submenu-widget').imageready(this.setReadyStatus.bind(this));

            this.model.getChildren().each(function(item, index) {
                //console.log("---------> ", this.$('.submenu-grid-item .submenu-item-image').parent().filter('[data-index="' + index + '"]').children( ".submenu-item-image" ).hasClass('visited'));
                if(this.$('.submenu-grid-item .submenu-item-image').parent().filter('[data-index="' + index + '"]').children( ".submenu-item-image" ).hasClass('visited')) {
                    this.$('.submenu-grid-item .submenu-item-image').parent().filter('[data-index="' + index + '"]').addClass('visited');
                }
            });
            // this.model.getChildren().each(function(item, index) {
            //     var pageID = item.attributes._link;
            //     var pageModel = Adapt.findById(pageID);
            //     var pageProgress = CompletionCalculation.calculatePercentageComplete(pageModel);
            //     console.log('page progress ', pageProgress, ', index: ', index);
            //     if(pageProgress==100) {
            //         this.$('.submenu-grid-item').filter('[data-index="' + index + '"]').addClass('completed');
            //     }
            // });
            // var currentModel = Adapt.findById(Adapt.location._currentId);
            // var completionState = {
            //     currentLocation: completionCalculations.calculatePercentageComplete(currentModel),
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.render();
        },

        setUpColumns: function() {
            // var columns = this.model.get('_columns');

            // if (columns && Adapt.device.screenSize === 'large') {
            //     this.$('.submenu-grid-item').css('width', (100 / columns) + '%');
            // }

            var columns = undefined;

            if(typeof(this.model.get('_columns'))=="number" && Adapt.device.screenSize === 'large'){
                columns = this.model.get('_columns');
            }
            if(typeof(this.model.get('_columns'))=="object") {
                columns = this.model.get('_columns')['_'+Adapt.device.screenSize];
            }
            console.log('setUpColumns, columns: ', columns);
            
            if (columns) {
                this.$('.submenu-grid-item').css('width', (100 / columns) + '%');
            }
        },

        onItemsActiveChange: function(model, _isActive) {
            this.getItemElement(model).toggleClass('active', _isActive);
        },

        getItemElement: function(model) {
            var index = model.get('_index');
            return this.$('.submenu-grid-item').filter('[data-index="' + index + '"]');
        },

        onItemsVisitedChange: function(model, _isVisited) {
            if (!_isVisited) return;
            var $item = this.getItemElement(model);

            // Append the word 'visited' to the item's aria-label
            var visitedLabel = this.model.get('_globals')._accessibility._ariaLabels.visited + '.';
            $item.attr('aria-label', function(index, val) {
                return val + ' ' + visitedLabel;
            });

            $item.addClass('visited');
        },

        onItemClicked: function(event) {
            if (event) event.preventDefault();

            var item = this.model.getItem($(event.currentTarget).data('index'));
            item.toggleActive(true);
            item.toggleVisited(true);
            
            var link = item.attributes._link;
            if(link)
                Backbone.history.navigate('#/id/' + link, {trigger: true});
            else
                console.warn('Please provide desired page id to launch it')
        }
    });

    return SubmenuView;
});
