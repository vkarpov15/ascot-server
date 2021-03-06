/**
 *  goldfinger.js
 *
 *  Created on: April 11, 2013
 *      Author: Valeri Karpov
 *
 *  General tool that, at least initially, is a wrapper around Knox's quirks
 *  for taking an image, resizing it if necessary, and putting it on S3.
 *
 */

exports.Goldfinger = function(fs, gm, temp, uploadHandler) {
  this.maxWidth = 700;

  this.setMaxWidth = function(width) {
    this.maxWidth = width;
  };

  this.toS3 = function(imagePath, resultName, callback) {
    var finish = function(path, features) {
      uploadHandler(path, resultName, function(error, result) {
        fs.unlink(path, function(e) {
          callback(error, result, features);
        });
      });
    };

    var self = this;
    if (self.maxWidth) {
      gm(imagePath).size(function(error, features) {
        if (error || !features) {
          callback("The provided file does not appear to be an image", null, null);
        } else if (features.width > self.maxWidth) {
          gm(imagePath).resize(self.maxWidth, features.height * (self.maxWidth / features.width)).write(imagePath, function(error) {
            finish(imagePath, { height : features.height * (self.maxWidth / features.width), width: self.maxWidth });
          });
        } else {
          finish(imagePath, { height : features.height, width : features.width });
        }
      });
    }
  };
};