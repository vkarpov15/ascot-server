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
        console.log("ZZ " + JSON.stringify(features));
        if (error || !features) {
          callback("The provided file does not appear to be an image", null, null);
        } else if (features.width > self.maxWidth) {
          gm(imagePath).resize(700, features.height * (700 / features.width)).write(imagePath, function(error) {
            fs.unlink(imagePath, function(e) {
              finish(imagePath, { height : features.height * (700 / features.width), width: 700 });
            });
          });
        } else {
          finish(imagePath, { height : features.height, width : features.width });
        }
      });
    }
  };
};