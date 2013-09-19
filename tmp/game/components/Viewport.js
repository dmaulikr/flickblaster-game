// Generated by CoffeeScript 1.6.1
(function() {
  var Viewport, device, followEasing, win;

  device = require('../../core/device');

  win = $(window);

  followEasing = 20;

  /*
  ## Viewport Class
  
  Contains game view elements on its wrapping elements, takes care of panning them into the screen
  after adapting to the screen size, it also takes care of translating screen coordinates into game
  coordinates and vice-versa
  
  This conversion is used by all modules that deal with rendering, and allows dealing with game
  logic, physics and measurement with better flexibility and ease
  */


  Viewport = (function() {

    function Viewport(el, width, height) {
      this.el = el;
      this.width = width;
      this.height = height;
      this.scaleRatio = 0;
      this.x = 0;
      this.y = 0;
      this.screen = device.getSize();
      this.fitInScreen();
      this.elWidth = this.el.width();
      this.elHeight = this.el.height();
      this.center();
    }

    Viewport.prototype.center = function() {
      return this.moveTo((this.screen.width - this.elWidth) / 2, (this.screen.height - this.elHeight) / 2);
    };

    Viewport.prototype.fitInScreen = function() {
      this.scaleRatio = this.width / this.screen.width;
      return this.el.css({
        width: this.width / this.scaleRatio,
        height: this.height / this.scaleRatio
      });
    };

    Viewport.prototype.moveTo = function(x, y, duration, callback, ease) {
      var newX, newY,
        _this = this;
      if (duration == null) {
        duration = 0;
      }
      if (callback == null) {
        callback = null;
      }
      if (ease == null) {
        ease = false;
      }
      if (ease && !duration) {
        newX = this.x + (x - this.x) / followEasing;
        newY = this.y + (y - this.y) / followEasing;
        if ((Math.abs(this.x - newX)) < .1 && (Math.abs(this.y - newY)) < .1) {
          return;
        } else {
          this.x = newX;
          this.y = newY;
        }
      } else {
        if (this.x === x && this.y === y) {
          return;
        }
        this.x = x;
        this.y = y;
      }
      if (!duration) {
        this.el.css({
          x: this.x,
          y: this.y
        });
        if (callback != null) {
          return callback();
        }
      } else {
        return this.el.transition({
          x: this.x,
          y: this.y
        }, duration, function() {
          if (callback != null) {
            return callback();
          }
        });
      }
    };

    Viewport.prototype.worldToScreen = function(value) {
      if (typeof value === 'object' && (value.x != null) && (value.y != null)) {
        return {
          x: this.worldToScreen(value.x),
          y: this.worldToScreen(value.y)
        };
      } else {
        return value / this.scaleRatio;
      }
    };

    Viewport.prototype.screenToWorld = function(value) {
      if (typeof value === 'object' && (value.x != null) && (value.y != null)) {
        return {
          x: this.screenToWorld(value.x),
          y: this.screenToWorld(value.y)
        };
      } else {
        return value * this.scaleRatio;
      }
    };

    Viewport.prototype.fits = function() {
      return this.elHeight <= this.screen.height;
    };

    Viewport.prototype.followEntity = function(target, duration, callback) {
      var margin, targetPos, x, y;
      if (duration == null) {
        duration = 0;
      }
      if (callback == null) {
        callback = null;
      }
      targetPos = this.worldToScreen(target.position());
      x = -targetPos.x + this.screen.width / 2;
      y = -targetPos.y + this.screen.height / 2;
      if (this.elHeight >= this.screen.height) {
        margin = this.elHeight - this.screen.height;
        if (y > 0) {
          y = 0;
        } else if (y < -margin) {
          y = -margin;
        }
      }
      if (this.elWidth >= this.screen.width) {
        margin = this.elWidth - this.screen.width;
        if (x > 0) {
          x = 0;
        } else if (x < -margin) {
          x = -margin;
        }
      }
      return this.moveTo(x, y, duration, callback, true);
    };

    return Viewport;

  })();

  module.exports = Viewport;

}).call(this);