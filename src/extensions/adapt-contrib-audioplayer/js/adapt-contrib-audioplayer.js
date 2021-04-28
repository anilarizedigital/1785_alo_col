/**
 * AudioPlayer Extension,
 * 
 */
define(function(require) {
    var _ = require('underscore'),
        Backbone = require('backbone'),
        Adapt = require('coreJS/adapt'),
        isMenuInView = false,
        AudioPlayer = function() {};

    AudioPlayer.prototype = _.extend({
        areListenersApplied: false,
        initialAlertVisible: false,
        blockAudioPlaying: "",
        blockCompletelyInView: "",
        blockTopInView: "",
        blockCounts: 0,
        isMenuVisitedAlready: false,

        resetPlayer: function() {
            if (this.$blockElement != null) {
                this.$blockElement.off("inview", _.bind(this.onBlockInView, this));
                //this.$blockElement.off("onscreen", _.bind(this.onBlockOnScreen, this));
            }

            this.$blockElement = null;
            this._blockModel = null;
            this._blockAudModel = null;
            // this._firstId = null;
            // this._activeId = null;
            // this._activeIdCopy = null;
            this._prevSrc = '';
            this._blockVisible = 'none';
        },

        initialize: function($targetPlayerElement) {
            //console.log("AudioPlayer: initialize", $targetPlayerElement, ', this.areListenersApplied: ', this.areListenersApplied);
            this._$audioElement = null;
            if ($targetPlayerElement) {
                $($targetPlayerElement).first().prepend("<div class='global-audio-player' aria-hidden='true'><audio id='audPlayer' preload='auto' autoplay type='audio/mp3'/></div>");
                this._$audioElement = $($targetPlayerElement).find('audio');
                this.setupPlayer();
                //console.log("value of  this"+this);
            }

            if(!this.areListenersApplied) {
                this.areListenersApplied = true;
                Adapt.on("blockView:postRender", this.onViewPostRender, this);
                this.listenTo(Adapt, "remove", this.resetPlayer);
                this.listenTo(Adapt, "navigationView : AudioButton", this.playAudio);
                this.listenTo(Adapt, "function:initialAlertBoxClosed", this.onInitialAlertBoxClosed);
            }
            
            var _that = this;
            // Listen for scroll events
            window.addEventListener('scroll', function ( event ) {

                // Clear our timeout throughout the scroll
                _that.tempBlockCounter = 0;
                window.clearTimeout( _that.isScrolling );

                // Set a timeout to run after scrolling ends
                _that.isScrolling = setTimeout(function() {

                    // Run the callback
                    console.log( 'Scrolling has stopped.' );
                    _that.blockCompletelyInView = "";
                    _that.blockTopInView = "";

                }, 70);

            }, false);
        },

        onInitialAlertBoxClosed: function(shouldPlayAudio) {
            console.log('function:initialAlertBoxClosed, shouldPlayAudio: ', shouldPlayAudio);
            this.initialAlertVisible = false;
            //if(shouldPlayAudio != false)
                this.playAudio();
        },

        setupPlayer: function() {
            var modelOptions = {};
            if (modelOptions.pluginPath === undefined) {
                modelOptions.pluginPath = 'assets/';
                /*if (modelOptions.type === undefined)*/ modelOptions.type = 'audio';
                /*if (modelOptions.audioWidth === undefined)*/ modelOptions.audioWidth = '2';
                /*if (modelOptions.audioHeight === undefined)*/ modelOptions.audioHeight = '2';
            }
            // create the player
            this._$audioElement.mediaelementplayer(modelOptions);

            $(this._$audioElement).on({
                'ended': this.onMediaElementEnded,
                'play': this.onMediaElementPlay,
                'pause': this.onMediaElementPause,
            })
            console.log('setupPlayer');
        },

        onMediaElementEnded: function(event) {
            console.log('onMediaElementEnded');
            Adapt.trigger("audioplayer:ended");
        },

        onViewPostRender: function(view) {
            //console.log('onViewPostRender this.blockCounts: ' + this.blockCounts);
            this.blockCounts++;
            this.$blockElement = view.$el;
            var _blockModelObj = view.model,
                _blockAudModelObj = _blockModelObj.get("_audio"),
                id = _blockModelObj.get("_id");

            // if (!this._firstId) {
            //     this._firstId = id;
                this._blockAudModel = _blockAudModelObj;
            //}

            this.$blockElement.attr("data-audioId", id);
            this.$blockElement.on("inview", _.bind(this.onBlockInView, this));
            //this.$blockElement.on("onscreen", _.bind(this.onBlockOnScreen, this));

            //this._activeId = this._firstId;
            if (!_blockAudModelObj || !_blockAudModelObj._isEnabled) {
                this.resetPlayer();
                return;
            }
        },
        tempBlockCounter: 0,
        onBlockInView: function(event, visible, visiblePartX, visiblePartY) {
            var id = $(event.target).attr("data-audioId");
            this.tempBlockCounter++;
            //console.log('onBlockInView, id: ', id, ', this.blockCounts: ', this.blockCounts, ', this.tempBlockCounter: ', this.tempBlockCounter);
            
            if(visible){
                
                if (visiblePartY === 'both') {
                    //blocksCompletelyInView.push(id);
                    if($(event.target).hasClass('ignore-for-audio')) return;
                    this.blockCompletelyInView = id;
                } else if (visiblePartY === 'top') {
                    if($(event.target).hasClass('ignore-for-audio')) return;
                    this.blockTopInView = id;
                }
                // console.log('this.blockCompletelyInView: ', this.blockCompletelyInView, ', this.blockTopInView: ', this.blockTopInView);
                // if (this.blockCompletelyInView != "")
                //     this.playBlockAudio(this.blockCompletelyInView, true);
                // else if (this.blockTopInView != "")
                //     this.playBlockAudio(this.blockTopInView, false);

                // if (visiblePartY === 'both') {
                //     console.log('visible both top and bottom, onBlockInView: ', id);
                //     if($(event.target).hasClass('ignore-for-audio')) return;
                //     this.playBlockAudio(id);
                //     return;
                // }
                // if (visiblePartY === 'top') {
                //     console.log('visible only top, onBlockInView: ', id);
                //     this.playBlockAudio(id);
                // }
            } else {
                // if(id===this._blockVisible){
                //     this._blockVisible = 'none';
                //     this._prevSrc = '';
                //     this._$audioElement.attr('src', "");
                //     this._$audioElement[0].pause();
                //     Adapt.trigger("audioplayer:ended");
                // }
            }

            //console.log('this.blockCounts: ', this.blockCounts, ', this.tempBlockCounter: ', this.tempBlockCounter);
            if(this.tempBlockCounter==this.blockCounts){
                this.tempBlockCounter = 0;
                console.log('this.blockCompletelyInView: ', this.blockCompletelyInView, ', this.blockTopInView: ', this.blockTopInView);
                if (this.blockCompletelyInView != "")
                    this.playBlockAudio(this.blockCompletelyInView);
                else if (this.blockTopInView != "")
                    this.playBlockAudio(this.blockTopInView);
            }
        },

        playBlockAudio: function(id) {
            //console.log('playBlockAudio, id: ', id, ', this._blockVisible: ', this._blockVisible);
            if(id != this._blockVisible) {
                this.blockCompletelyInView = "";
                this._blockVisible = id
                console.log('onBlockInView, id: ', id);
                var _blockmodel = Adapt.blocks.findWhere({ _id: id });
            
                if (_blockmodel) {
                    this._blockAudModel = _blockmodel.get("_audio");
                    var _defaultSrc = (this._blockAudModel && this._blockAudModel._playlist && this._blockAudModel._playlist._default) ? this._blockAudModel._playlist._default : "";
                    
                    if (_defaultSrc != "" && _defaultSrc != null) {
                        if(_defaultSrc != this._prevSrc) {
                            this._prevSrc = _defaultSrc;
                            console.log("audioplayer, onBlockInView, _defaultSrc: ", _defaultSrc);
                            this._$audioElement.attr('src', _defaultSrc);
                            this._$audioElement[0].load();

                            Adapt.trigger("navigationView : AudioButton")
                        }
                    } else {
                        this._prevSrc = _defaultSrc;
                        this._$audioElement.attr('src', "");
                        this._$audioElement[0].pause();
                        //Adapt.trigger("audioplayer:ended");
                    }
                }
            }
        },

        playAudio: function() {
            //console.log('playAudio, this.initialAlertVisible - ' + this.initialAlertVisible);
            if (this.initialAlertVisible) {
                /*if(isMenuInView) Adapt.trigger('audioplayer:pausemenuaudio')
                else*/ this._$audioElement[0].pause();
            } else {
                /*if(isMenuInView) Adapt.trigger('audioplayer:playmenuaudio')
                else*/ this._$audioElement[0].play();
            }
        },

        stopAudio: function() {
            //console.log('stopAudio, this._$audioElement: ', this._$audioElement);
            this._$audioElement.attr('src', "");
            this._$audioElement[0].load();
            this._$audioElement[0].pause();

            $('video,audio').each(function() {
                $(this)[0].pause();
            });
        },

        onMediaElementPlay: function() {
            Adapt.trigger("audioplayer:playing");
        },
        
        onMediaElementPause: function() {
            Adapt.trigger("audioplayer:stopped");
        },

        getOS: function() {
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
                return 'iOS';
            } else if (userAgent.match(/Android/i)) {
                return 'Android';
            } else {
                return 'unknown';
            }
        }
    }, Backbone.Events);

    Adapt.on("app:dataReady", function() {
        //var isMenuPreRendered = false;
        var _config = Adapt.config.get("_audio");
        if (!_config || !_config._isEnabled) return;
        console.log("AudioPlayer data ready");
        Adapt.audio = new AudioPlayer();

        Adapt.on("pageView:ready", function(){
            console.log('audioplayer, pageView:ready, Adapt.offlineStorage.get(role): ', Adapt.offlineStorage.get('role'));
            if($('html').hasClass('os-ios') != true) {
                if(Adapt.offlineStorage.get('role')!=undefined) return;
            }
            //console.log('pageView:ready:: Adapt.audio.initialAlertVisible-', Adapt.audio.initialAlertVisible, " $('html').hasClass('os-ios')-", $('html').hasClass('os-ios'));
            // if(Adapt.audio.initialAlertVisible || $('html').hasClass('os-ios')) {
            //     Adapt.trigger('notify:prompt', {
            //         title: '',
            //         body: 'This course uses audio. Please ensure that your sound is turned on.<br>',
            //         _classes: 'initial-alert-box',
            //         _prompts:[
            //             {
            //                 promptText: "OK",
            //                 _callbackEvent: "function:initialAlertBoxClosed"
            //             }
            //         ]
            //     });
            // }
        });
        Adapt.on("menuView:ready", function(view){
            console.log('audioplayer, menuView:ready, Adapt.audio.initialAlertVisible: ', Adapt.audio.initialAlertVisible);
            if($('html').hasClass('os-ios') != true || !Adapt.audio.isMenuVisitedAlready) {
                if(Adapt.offlineStorage.get('location').length > 0) return;
            }
            //console.log('menuView:ready:: Adapt.audio.initialAlertVisible-', Adapt.audio.initialAlertVisible, " $('html').hasClass('os-ios')-", $('html').hasClass('os-ios'));
            //console.log('menuView:ready:: view-_isMenuVisited - ', view.model.get('_isMenuVisited'));
            //if(Adapt.audio.initialAlertVisible || $('html').hasClass('os-ios') && (view.model.get('_isMenuVisited') != true )) {
            // if((Adapt.audio.initialAlertVisible || $('html').hasClass('os-ios')) && !Adapt.audio.isMenuVisitedAlready) {
            //     Adapt.trigger('notify:prompt', {
            //         title: '',
            //         body: 'This course uses audio. Please ensure that your sound is turned on.<br>',
            //         _classes: 'initial-alert-box',
            //         _prompts:[
            //             {
            //                 promptText: "OK",
            //                 _callbackEvent: "function:initialAlertBoxClosed"
            //             }
            //         ]
            //     });
            // }
        });
        Adapt.on("pageView:postRender", function(view) {
            console.log('pageView:postRender');
            Adapt.audio.tempBlockCounter = 0;
            Adapt.audio.blockCounts = 0;
            isMenuInView = false;
            Adapt.audio.initialize(view.$el);
        });
        Adapt.on("menuView:postRender", function(view) {
            console.log('menuView:postRender');
            if(!isMenuInView) {
                Adapt.audio.tempBlockCounter = 0;
                Adapt.audio.blockCounts = 0;
                isMenuInView = true;
                Adapt.audio.initialize(view.$el);
            }
        });
    });
})