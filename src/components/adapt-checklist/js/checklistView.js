define([
    'core/js/adapt',
    'core/js/views/componentView'
], function(Adapt, ComponentView) {

    var ChecklistView = ComponentView.extend({

        events: {
            'click .component-item input':'onItemClicked',
            'change .component-item input':'onItemSelect',
        },

        initialize: function() {
            ComponentView.prototype.initialize.call(this);
            this.update = _.debounce(this.update.bind(this), 1);
            this.listenTo(this.model.getChildren(), {
                "change:_isActive": this.update
            });
            //this.setUpViewData();
            //this.setUpModelData();
            //this.setUpEventListeners();
            this.checkIfResetOnRevisit();
        },

        // setUpViewData: function() {
        //     this.popupView = null;
        //     this._isPopupOpen = false;
        // },

        // setUpModelData: function() {
        //     if (this.model.get('_canCycleThroughPagination') === undefined) {
        //         this.model.set('_canCycleThroughPagination', false);
        //     }
        // },

        // setUpEventListeners: function() {
        //     //this.listenTo(Adapt, 'device:changed', this.reRender);

        //     this.listenTo(this.model.get('_children'), {
        //         'change:_isActive': this.onItemsActiveChange,
        //         'change:_isVisited': this.onItemsVisitedChange
        //     });
        // },

        // reRender: function() {
        //     if (Adapt.device.screenSize !== 'large') {
        //         this.replaceWithNarrative();
        //     }
        // },

        // replaceWithNarrative: function() {
        //     var NarrativeView = Adapt.getViewClass('narrative');

        //     var model = this.prepareNarrativeModel();
        //     var newNarrative = new NarrativeView({ model: model });
        //     var $container = $(".component-container", $("." + this.model.get("_parentId")));

        //     newNarrative.reRender();
        //     newNarrative.setupNarrative();
        //     $container.append(newNarrative.$el);
        //     Adapt.trigger('device:resize');
        //     _.defer(this.remove.bind(this));
        // },

        // prepareNarrativeModel: function() {
        //     var model = this.model;
        //     model.set({
        //         '_component': 'narrative',
        //         '_wasHotgraphic': true,
        //         'originalBody': model.get('body'),
        //         'originalInstruction': model.get('instruction')
        //     });

        //     // Check if active item exists, default to 0
        //     var activeItem = model.getActiveItem();
        //     if (!activeItem) {
        //         model.getItem(0).toggleActive(true);
        //     }

        //     // Swap mobile body and instructions for desktop variants.
        //     if (model.get('mobileBody')) {
        //         model.set('body', model.get('mobileBody'));
        //     }
        //     if (model.get('mobileInstruction')) {
        //         model.set('instruction', model.get('mobileInstruction'));
        //     }

        //     return model;
        // },

        // onItemsActiveChange: function(model, _isActive) {
        //     this.getItemElement(model).toggleClass('active', _isActive);
        // },

        // getItemElement: function(model) {
        //     var index = model.get('_index');
        //     return this.$('.component-item input').filter('[data-index="' + index + '"]');
        // },

        // onItemsVisitedChange: function(model, _isVisited) {
        //     if (!_isVisited) return;
        //     var $item = this.getItemElement(model);

        //     // Append the word 'visited.' to the pin's aria-label
        //     var visitedLabel = this.model.get('_globals')._accessibility._ariaLabels.visited + ".";
        //     $item.attr('aria-label', function(index, val) {
        //         return val + " " + visitedLabel;
        //     });

        //     $item.addClass('visited');
        // },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        preRender: function() {
            if (Adapt.device.screenSize === 'large') {
                this.render();
            } else {
                //this.reRender();
            }
        },

        postRender: function() {
            this.setReadyStatus();
            this.setupInview();

            this.$('.checklist-widget').imageready(this.setReadyStatus.bind(this));
            if (this.model.get('_setCompletionOn') === 'inview') {
                this.setupInviewCompletion('.component-widget');
            }
        },

        setupInview: function() {
            var selector = this.getInviewElementSelector();
            if (!selector) {
                this.setCompletionStatus();
                return;
            }

            this.setupInviewCompletion(selector);
        },

        /**
         * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
         */
        getInviewElementSelector: function() {
            if (this.model.get('body')) return '.component-body';

            if (this.model.get('instruction')) return '.component-instruction';

            if (this.model.get('displayTitle')) return '.component-title';

            return null;
        },

        onItemSelect: function(event) {
            var index = $(event.currentTarget).data('adapt-index');
            var itemModel = this.model.getItem(index);
            var shouldSelect = !itemModel.get("_isActive");
            itemModel.toggleActive(shouldSelect);
        },

        update: function() {
            this.updateSelection();
        },

        updateSelection: function() {

            var isEnabled = this.model.get("_isEnabled");

            this.model.getChildren().each(function(itemModel) {

                var isSelected = itemModel.get("_isActive");

                var index = itemModel.get('_index');
                this.$('label').filter('[data-adapt-index="' + index + '"]')
                    .toggleClass('selected', isSelected)
                    .toggleClass('disabled', !isEnabled);

                this.$('input').filter('[data-adapt-index="' + index + '"]')
                    .prop('checked', isSelected)
                    .prop('disabled', !isEnabled);

            }.bind(this));

        }
    });

    return ChecklistView;

});
