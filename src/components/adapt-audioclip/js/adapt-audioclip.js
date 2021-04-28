define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var AudioClip = ComponentView.extend({

        events: {
            'inview': 'onInview',
            "click .buttons-action": "showTranscript"
        },
        
        postRender: function() {
            var _this = this;

            this.$('.clip-audio')[0].onplay = function() {_this.onAudioPlay(_this)};
            //this.$('.clip-audio')[0].onended = function() {_this.onAudioEnded(_this)};

            this.setReadyStatus();
        },

        onAudioPlay: function($scope) {
            var thisID = this.model.get('_id');
            $('.clip-audio').each(function(index) {
                if(!$(this).hasClass(thisID)) {
                    $('.clip-audio')[index].pause();
                }
            });
            this.setCompletionStatus();
        },

        // onAudioEnded: function($scope) {
        //     $scope.setCompletionStatus();
        // },

        onInview: function(event, visible, visiblePartX, visiblePartY) {
            if(!visible) this.$('.clip-audio')[0].pause();
        },

        showTranscript: function(event) {
            Adapt.trigger('notify:popup', {
                body: this.model.get('_item')._transcript.body
            });
        }
    });

    Adapt.register('audioclip', AudioClip);

    return AudioClip;

});