define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var StackList = ComponentView.extend({

        TRANSITION_TIME: 250,

        events: {
            "click .stacklist-next": "nextItem"
        },

        preRender: function() {
            this.listenTo(Adapt, {
                'device:resize': this.onScreenSizeChanged,
                'device:changed': this.onScreenSizeChanged
            });
            this.model.set("_globals", Adapt.course.get("_globals"));
            this.model.set("_stage", -1);
            this.setupButton();
        },

        postRender: function() {
            //if (!this.model.get("_isComplete") || this.model.get("_isResetOnRevisit")) this.setupListItems();
            this.setupListItems();
            this.setReadyStatus();
            var that = this;
            setTimeout(function() {
                console.log('1, setTimeout');
                that.nextItem();
            }, 1000);
        },

        setupButton: function() {
            var _button = this.model.get("_button") || {};
            // Set up button aria label

            var btnAriaLabel = this.model.get("_globals")._components._stacklist.ariaButtonLabel || this.model.get("_globals")._accessibility._ariaLabels.next;
            this.model.set({buttonAriaLabel: btnAriaLabel});

            if (!_button.startText) _button.startText = "";
            if (!_button.continueText) _button.continueText = "";
            if (!_button.ariaLabel) _button.ariaLabel = btnAriaLabel;

            this.model.set("_button", _button);
        },

        setupListItems: function() {

            // Set item positions alternating R and L
            var wWin = $(window).width();
            var $items = this.$(".stacklist-item");

            //$items.addClass("visibility-hidden");
            $items.css('display', 'none');

            //$items.each(function(i) {
                //var $el = $items.eq(i);
                //var even = i % 2 === 0;
                //var offset = $el.offset();
                //offset.left = even ? - ($el.outerWidth() + 10) : wWin + 10;
                //$el.offset(offset);
           // });
            this.$(".stacklist-button").show();
        },

        onScreenSizeChanged: function() {
            var currentStage = this.model.get("_stage");
            this.setStage(currentStage);
        },

        nextItem: function() {
            var stage = this.model.get("_stage") + 1;

            console.log('nextItem, stage: ', stage);

            this.setStage(stage);
        },

        setStage: function(stage) {
            var sameStage = false;
            if(stage===this.model.get("_stage"))
                sameStage = true;

            var $item = this.$(".stacklist-item").eq(stage);
            if(!sameStage){
                this.model.set("_stage", stage);

                var continueText = this.model.get("_items")[stage].next || this.model.get("_button").continueText;
                var btnAriaLabel = this.model.get("_button").ariaLabel;
                var isComplete = this.model.get("_items").length - 1 === stage;

                if (!isComplete) {
                    this.$(".stacklist-next")
                    .attr("aria-label", continueText + ", " + btnAriaLabel)
                    .html(continueText);
                }
                

                //$item.removeClass("visibility-hidden");
                $item.css('display', 'block');
                //$item.addClass("show").a11y_focus();

                if (isComplete) {
                    this.onComplete()
                }
            }

            var itemHeight = $item.outerHeight(true);
            if(sameStage) {
                this.$('.visibility-hidden').css('display', 'none');
                var newH = parseInt(this.$('.stacklist-items').outerHeight(true));
                var newH1 = parseInt(this.$('.stacklist-items').innerHeight());
                console.log("stacklist-items outerHeight:", newH, ' newH1: ', newH1);
                this.$('.visibility-hidden').css('display', 'block');
                this.$(".stacklist-button").css({top: (newH1+'px')});
            } else {
                this.$(".stacklist-button").velocity({top: "+=" + itemHeight}, this.TRANSITION_TIME);
            }
        },

        onComplete: function () {
            var _this = this;
            var $button = this.$(".stacklist-button");
            $button.velocity({opacity: 0}, {
                duration: this.TRANSITION_TIME,
                queue: false,
                complete: function() {
                    $button.remove();
                    _this.$('.stacklist-items').css('margin-bottom', '-5px');
                }
            });

            this.setCompletionStatus();
        }
    });

    Adapt.register('stacklist', StackList);

    return StackList;

});
