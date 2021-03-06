/**
 *  MongoLookFactory.js
 *
 *  Created on: November 17, 2012
 *      Author: Valeri Karpov
 *
 *  Interface to MongoDB for the Look model
 *
 */

exports.MongoLookFactory = function(url, Look, Permissions) {
  this.getRandom = function(callback) {
    rand = Math.random();
    Look.findOne({ random : { $near : [rand, 0] }, showOnCrossList : 1 }, function(error, look) {
      if (error || !look) {
        callback(error, null);
      } else {
        callback(error, look);
      }
    });
  };

  this.buildFromId = function(id, callback) {
    Look.findOne({ _id : id }).exec(function(error, result) {
      if (error || !result) {
        callback(error, null);
      } else {
        callback(null, result);
      }
    });
  };
  
  var pushLookToUser = function(user, look, permissions, callback) {
    if (user) {
      user.looks.push(look._id);
      user.save(function(error, user) {
        if (error || !user) {
          callback(error, null, null);
        } else {
          callback(null, look, permissions);
        }
      });
    } else {
      callback(null, look, permissions);
    }
  };

  this.newLook = function(user, permissionsList, callback) {
    var look = new Look({ url : "", search : [], tags : [], random : [Math.random(), 0] });
    look.save(function(error, savedLook) {
      if (error || !savedLook) {
        callback(error, null);
      } else {
        //look.url = url + '/images/uploads/' + look._id + '.png';
        look.save(function(error, savedLookWithUrl) {
          if (error || !savedLookWithUrl) {
            callback(error, null);
          } else {
            if (permissionsList && permissionsList.length > 0) {
              Permissions.findOne({ _id : permissionsList[0] }, function(error, permission) {
                if (error || !permission) {
                  console.log("ZZZZZ " + JSON.stringify(permissionsList));
                  callback("error - permission " + permissionsList[0] + " not found.", null, null);
                } else {
                  permission.images.push(savedLookWithUrl._id);
                  permission.save(function(error, perms) {
                    if (error || !perms) {
                      callback(error, null, null);
                    } else {
                      pushLookToUser(user, savedLookWithUrl, perms, callback);
                    }
                  });
                }
              });
            } else {
              var permission = new Permissions({ images : [ savedLookWithUrl._id ] });
              permission.save(function(error, perms) {
                if (error || !perms) {
                  callback(error, null);
                } else {
                  pushLookToUser(user, savedLookWithUrl, perms, callback);
                }
              });
            }
          }
        });
      }
    });
  };

  this.newLookWithUrl = function(user, url, callback) {
    var look = new Look({ url : url,
                          search : [],
                          tags : [],
                          random : [Math.random(), 0],
                          source : url });

    look.save(function(error, savedLook) {
      if (error || !savedLook) {
        callback(error, null);
      } else {
        var permission = new Permissions({ images : [ savedLook._id ] });
        permission.save(function(error, perms) {
          if (error || !perms) {
            callback(error, null);
          } else {
            pushLookToUser(user, savedLook, perms, callback);
          }
        });
      }
    });
  };
  
  this.setHeightAndWidth = function(id, height, width, callback) {
    Look.findOne({ _id : id }).exec(function(error, look) {
      if (error || !look) {
        callback(error, null);
      } else {
        console.log("GOT HEIGHT=" + height + " & WiDTH=" + width);
        look.size.height = height;
        look.size.width = width;
        look.save(function(error, look) {
          if (error || !look) {
            callback(error, null);
          } else {
            callback(null, look);
          }
        })
      }
    });
  };
};
