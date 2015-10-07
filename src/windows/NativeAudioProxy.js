// HMTLAudioElement map
var assetsLoad = {};

/**
 * Creates en HTMLAudioELement and append it to the body DOM element/
 * @param {String} id Audio asset identifier 
 * @param {String} assetPath Asset file with absolute path
 */
function createAudioElement(id, assetPath) {
    
    // Create HTMLAudioElement
    //var audio = new Audio(assetPath);
    var audio = '<audio src="'+ assetPath +'" id="'+ id +'" preload="auto"></audio>';
    
    // Append element to the body element
    document.getElementsByTagName('body')[0].appendChild(audio);
    
    // Retrieve the appended element
    assetsLoad[id] = document.getElementById(i);

    if (!assetsLoad[id]) {
        throw "Unable to add HTMLAudio element for asset : "+ assetPath;
    }

    assetsLoad[id].volume = 1;
}

// -----------------------------
//          PLUGIN API
// -----------------------------
module.exports  = {

    /**
     * Loads an audio assets within `www` directory from the project package root directory.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    preloadSimple: function(successCallback, errorCallback, args) {

        if (args.length < 2) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0],
            assetPath = args[1];

        // We check if the asset path already prefixed with the ms-appx:/// Windows protocol
        if (/^ms-appx:\/\/\//.test(assetPath) === false) {
            assetPath = 'ms-appx:///www/'+assetPath;
        }

        // If you are trying to load an already loaded asset
        if (assetsLoad[id]) {
            errorCallback("Asset already loaded : " + id + " => "+ assetPath);
        } else {
            try {
                // Create element
                createAudioElement(id, assetPath);                
                successCallback();
            } catch (e) {
                errorCallback(e);
            }
        }
    },

    /**
     * Loads an audio assets within `www` directory from the project package root directory,
     * ny specifying volume option.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    preloadComplex: function(successCallback, errorCallback, args) {

        if (args.length < 5) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0],
            assetPath = args[1],
            volume = args[2],
            voices = args[3],
            delay = args[4];

        if (voices || delay) {
            errorCallback("PreloadComplex with voices and delay not implemented !");
        }

        var that = this;

        var successPreload = function () {
            that.setVolumeForComplexAsset(id, volume, successCallback, errorCallback);
        };

        this.preloadSimple(id, assetPath, successPreload, errorCallback);
    },

    /**
     * Plays audio asset.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    play: function(successCallback, errorCallback, args) {

        if (args.length < 1) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0];

        if (!assetsLoad[id]) {
            errorCallback("Id not loaded : "+ id);
        }

        if(typeof completeCallback === "function") {
            assetsLoad[id].ended = completeCallback;
        }

        try {
            assetsLoad[id].play();
            successCallback();
        } catch (e) {
            errorCallback(e);
        }
    },

    /**
     * Stops playing audio asset.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    stop: function(successCallback, errorCallback, args) {

        if (args.length < 1) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0];

        if (!assetsLoad[id]) {
            errorCallback("Id not loaded : "+ id);
        }

        try {
            assetsLoad[id].stop();
            assetsLoad[id].loop = false;
            successCallback();
        } catch (e) {
            errorCallback(e);
        }
    },

    /**
     * Looping plays an audio asset.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    loop: function(successCallback, errorCallback, args) {

        if (args.length < 1) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0];

        if (!assetsLoad[id]) {
            errorCallback("Id not loaded : "+ id);
        }

        assetsLoad[id].loop = true;

        this.play(successCallback, errorCallback, [id]);
    },

    /**
     * Remove HTMLAudioElement from the DOM.
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    unload: function(successCallback, errorCallback, args) {

        if (args.length < 1) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0];

        if (assetsLoad[id]) {
            try {
                this.stop(id);
                document.getElementsByTagName('body')[0].removeChild(assetsLoad[id]);
                successCallback();
            } catch (e) {
                errorCallback(e);
            }
        }
    },

    /**
     * Sets an HTMLAudioElement volume. The volume range is [0.0;.1.0].
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @param {[]} args The first argument has to be the audio asset identifier and the second
     *                  the audio asset with path (e.g <app_directory>/www/path/to/audiofile.mp3)
     */
    setVolumeForComplexAsset: function (successCallback, errorCallback, args) {

        if (args.length < 2) {
            errorCallback("Invalid parameters length");
        }

        var id = args[0],
            volume = args[1];

        if (!assetsLoad[id]) {
            errorCallback("Id not loaded : "+ id);
        }

        var preVolume = parseFloat(volume, 10);
        if (Math.round(preVolume) > 1) {
            preVolume = 1;
        }

        if (Math.round(preVolume) < 0) {
            preVolume = 0;
        }

        assetsLoad[id].volume = preVolume;
        successCallback();
    }
};

// We specifiy proxy calls for `NativeAudio` default plugin identifier.
require("cordova/exec/proxy").add("NativeAudio",module.exports);