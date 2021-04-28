define([
    'core/js/adapt',
    'core/js/views/menuView',
    'extensions/adapt-contrib-pageLevelProgress/js/completionCalculations',
], function(Adapt, MenuView, CompletionCalculation) {

    var BoxMenuView = MenuView.extend({

        className: function() {
            return MenuView.prototype.className.apply(this) + " boxmenu-menu";
        },

        attributes: function() {
            return MenuView.prototype.resultExtend('attributes', {
                'role': 'main',
                'aria-labelledby': this.model.get('_id')+'-heading'
            }, this);
        },

        postRender: function() {
            //Update progress
            var commPageIds = [],
                commProgressIds = [],
                pageProgressPercentage = [];
            this.model.getChildren().each(function(item, index) {
                if (item.get('_showCommulativeProgress')) {
                    commPageIds.push(item.get('_id'));
                    commProgressIds.push(item.get('_commulativeProgressIds'));
                }
            });

            
            //console.log('commPageIds', commPageIds);
            //console.log('commProgressIds', commProgressIds);

            for(var i=0; i<commPageIds.length; i++) {
                var commProgressId = commProgressIds[i].split(',');
                var totalPercentage = 0;
                for(var j = 0; j<commProgressId.length; j++) {
                    var currentModel = Adapt.findById(commProgressId[j]);
                    var pagePercentage = CompletionCalculation.calculatePercentageComplete(currentModel);
                    totalPercentage += isNaN(pagePercentage) ? 0 : pagePercentage;
                    //console.log(commProgressId[j],"'s percentage is ", totalPercentage);
                }
                pageProgressPercentage[i] = totalPercentage / commProgressId.length;
            }
            //
            var nthChild = 0;
            var _epsilon = Math.pow(2, -52);
            this.model.getChildren().each(function(item) {
                if (item.get('_isAvailable') && !item.get('_isHidden')) {
                    item.set('_nthChild', ++nthChild);
                    var perc = Math.round((pageProgressPercentage[nthChild-1] + _epsilon) * 100) / 100;
                    console.log('item'+nthChild+' progress is ', perc);
                    item.set('_customeProgress', perc);
                    item.set('_allPagesVisited', perc==100?true:false);
                    this.$('.js-children').append(new BoxMenuItemView({model: item}).$el);
                }

                if(item.get('_isHidden')) {
                    item.set('_isReady', true);
                }
            });
        }

    }, {
        template: 'boxmenu'
    });

    var BoxMenuItemView = MenuView.extend({

        events: {
            'click button' : 'onClickMenuItemButton'
        },

        attributes: function() {
            return MenuView.prototype.resultExtend('attributes', {
                'role': 'listitem',
                'aria-labelledby': this.model.get('_id') + '-heading'
            }, this);
        },

        className: function() {
            var nthChild = this.model.get('_nthChild');
            return [
                'menu-item',
                'menu-item-' + this.model.get('_id') ,
                this.model.get('_classes'),
                this.model.get('_isVisited') ? 'visited' : '',
                //this.model.get('_isComplete') ? 'completed' : '',
                this.model.get('_allPagesVisited') ? 'completed' : '',
                this.model.get('_isLocked') ? 'locked' : '',
                'nth-child-' + nthChild,
                nthChild % 2 === 0 ? 'nth-child-even' : 'nth-child-odd'
            ].join(' ');
        },

        preRender: function() {
            this.model.checkCompletionStatus();
            this.model.checkInteractionCompletionStatus();
        },

        postRender: function() {
            var _this = this;
            //console.log('postRender, this.model._customeProgress: ', this.model._customeProgress)
            setTimeout(function(){
                _this.updateProgressText();
            }, 10);
            var graphic = this.model.get('_graphic');
            if (graphic && graphic.src) {
                this.$el.imageready(this.setReadyStatus.bind(this));
                return;
            }
            
            this.setReadyStatus();
        },

        onClickMenuItemButton: function(event) {
            if(event && event.preventDefault) event.preventDefault();
            if(this.model.get('_isLocked')) return;
            Backbone.history.navigate('#/id/' + this.model.get('_id'), {trigger: true});
        },

        updateProgressText: function() {
            this.$('.pagelevelprogress-indicator').after('<div class="menu-item-progress-text"></div>');
            // var bar = document.getElementsByClassName('pagelevelprogress-indicator-bar'),
            //     $bar = this.$('.pagelevelprogress-indicator-bar'),
            //     $text = this.$('.menu-item-progress-text'),
            //     barWidth = Math.ceil($bar.width() / $bar.parent().width() * 100) + "%", 
            //     observer = new MutationObserver(function(mutations) {
            //         mutations.forEach(function(mutation) {
            //             if (mutation.attributeName == "style") {
            //                 barWidth = Math.ceil($bar.width() / $bar.parent().width() * 100) + "%";
            //                 $text.html(barWidth);
            //             }
            //         });
            //     });

            // //console.log('updateProgressText bar - ', bar);
            // var config = {
            //     attributes: true,
            //     childList: true,
            //     characterData: true
            // };
            // observer.observe(bar[0], config);
            console.log('this.model._customeProgress: ', this.model.get('_customeProgress'));
            var $text = this.$('.menu-item-progress-text'),
                $bar = this.$('.pagelevelprogress-indicator-bar');
            $text.html(this.model.get('_customeProgress')+'%');
            $bar.css('width', this.model.get('_customeProgress')+'%');
        }

    }, {
        template: 'boxmenu-item'
    });

    Adapt.on('router:menu', function(model) {

        $('#wrapper').append(new BoxMenuView({model: model}).$el);

    });

});
