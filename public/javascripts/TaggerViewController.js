/*
 *  TaggerViewController.js
 *
 *  Created on: December 5, 2012
 *      Author: Valeri Karpov
 *
 *  Front-end controller for adding / deleting tags on an image
 *
 */

function TaggerViewController($scope, $http, ImageOffsetService) {
  this.$scope = $scope;

  $scope.idsToLooks = {};
  $scope.idsToEditTag = {};
  $scope.idsToSearchResults = {};

  // Initial load of look
  $scope.loadLook = function(id) {
    $scope.idsToLooks[id] = { _id : id, tags : [] };
    $http.get('/tags.jsonp?id=' + encodeURIComponent(id)).success(
        function(look) {
          $scope.idsToLooks[id] = look;
          $scope.idsToEditTag[id] = null;
          $scope.idsToSearchResults[id] = [];
        });
  };

  // Add a tag
  $scope.addTag = function(id, pageX, pageY) {
    var offset = ImageOffsetService.getOffset(id);
    var newTag =
        { index : $scope.idsToLooks[id].tags.length + 1,
          position : { x : (pageX - offset.x), y : (pageY - offset.y) } };

    $scope.idsToLooks[id].tags.push(newTag);
    $scope.editTaggedProduct(id, newTag);
    return newTag;
  };

  // Start editting a tag
  $scope.editTaggedProduct = function(id, tag) {
    $scope.idsToEditTag[id] = tag;
  };

  // Check if we're in editting state
  $scope.isEdittingTag = function(id) {
    return $scope.idsToEditTag[id] != null;
  };

  // Search for products
  $scope.findProducts = function(id, search) {
    $http.get('/products.json?query=' + encodeURIComponent(search)).success(
        function(results) {
          $scope.idsToSearchResults[id] = results.data;
        });
  };

  // Finish editting tagged product
  $scope.setTaggedProduct = function(id, product) {
    if ($scope.isEdittingTag(id)) {
      $scope.idsToEditTag[id].product = product._id;
      $scope.idsToEditTag[id] = null;
    }
  };

  // Delete a tag
  $scope.deleteTag = function(id, tag) {
    var index = -1;
    for (var i = 0; i < $scope.idsToLooks[id].tags.length; ++i) {
      if ($scope.idsToLooks[id].tags[i] == tag) {
        index = i;
        break;
      }
    }
    if (index != -1) {
      $scope.idsToLooks[id].tags.remove(index);
      for (var i = 0; i < $scope.idsToLooks[id].tags.length; ++i) {
        $scope.idsToLooks[id].tags[i].index = i + 1;
      }
    }
  };
}
