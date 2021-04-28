define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var AudioClip2 = ComponentView.extend({

        events: {
            'inview': 'onInview',
            "click .play-pause-audio": "playAudio",
            "click .buttons-action": "showTranscript"
        },
        isAudio: false,
        
        preRender: function() {
            this.isAudio = Adapt.config.get('_audio')._isEnabled;
        },

        postRender: function() {
            var _this = this;
            this.$('.clip-audio')[0].onplay = function() {_this.onAudioPlay(_this)};
            this.$('.clip-audio')[0].onpause = function() {_this.onAudioPause(_this)};
            //this.$('.clip-audio')[0].onended = function() {_this.onAudioEnded(_this)};

            this.setReadyStatus();
        },

        togglePlayPause: function() {
            if(this.$('.play-pause-audio').hasClass('paused')) {
                this.$('.play-pause-audio').removeClass('paused');
            } else {
                this.$('.play-pause-audio').addClass('paused');
            }
        },

        playAudio: function (event) {
            var $toggleButton = $(event.currentTarget);

            if(this.isAudio) {
                var thisID = this.model.get('_id');
                $('.clip-audio').each(function(index) {
                    if($(this).hasClass(thisID)) {
                        if($toggleButton.hasClass('paused')){
                            $('.clip-audio')[index].pause();
                        } else {
                            $('.clip-audio')[index].play();
                        }
                    }
                });
            }
        },

        onAudioPlay: function($scope) {
            var _this = this;
            var thisID = this.model.get('_id');
            $('.play-pause-audio').removeClass('paused');
            
            $('.clip-audio').each(function(index) {
                if(!$(this).hasClass(thisID))
                    $('.clip-audio')[index].pause();
            });
            $('.clip-audio').each(function(index) {
                if($(this).hasClass(thisID)) {
                    if(_this.$('.play-pause-audio').hasClass('paused')){
                        return false;
                    } else {
                        _this.$('.play-pause-audio').addClass('paused');
                        return false;
                    }
                }
            });
            this.setCompletionStatus();
            //this.togglePlayPause();
        },

        onAudioPause: function($scope) {
            var thisID = this.model.get('_id');
            this.$('.play-pause-audio').removeClass('paused');
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

    Adapt.register('audioclip2', AudioClip2);

    return AudioClip2;

});