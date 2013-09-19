// Generated by CoffeeScript 1.6.1

/*
## Assets module

Serves assets filenames depending on configuration and device pixel density
*/


(function() {
  var config, device, pr;

  device = require('../../core/device');

  pr = device.getPixelRatio();

  config = {
    suffix: pr === 1 ? '' : "@" + pr + "x",
    assetsDir: 'assets',
    ext: 'png'
  };

  module.exports = {
    getAssetPath: function(asset, ext) {
      if (ext == null) {
        ext = ext;
      }
      return "" + config.assetsDir + "/" + asset + config.suffix + "." + config.ext;
    }
  };

}).call(this);