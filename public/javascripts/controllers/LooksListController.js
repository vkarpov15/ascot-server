/**
 *  LooksListController.js
 *
 *  Created on: February 21, 2013
 *      Author: Valeri Karpov
 *
 *  Controller for looks list - sorting, filtering, pagination.
 *
 */
 
function LooksListController($scope, $http, $timeout, $dialog) {
  $scope.looks = [];
  $scope.columns = [];
  $scope.numLoaded = 0;
  $scope.numPages = 0;
  $scope.currentPage = 0;
  $scope.nextPage = 0;

  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template: '<iframe src="/look/513032623e92dee93b00002e/iframe" style="height: 800px; width: 800px;" />'
  };

  $scope.randomLook = function() {
    $http.get('/random', { headers : { accept : 'application/json' } }).
        success(function(look) {
          var width = Math.min(560, look.size.width);
          var height = (width == look.size.width ? look.size.height : look.size.height * (width / look.size.width));
          $scope.opts.template = '<iframe src="/look/' + look._id + '/iframe" style="height: ' + height + 'px; width: ' + width + 'px;" />';
          $dialog.dialog($scope.opts).open();
        });
  };
  
  $scope.$R = function(low, high) {
    var ret = [];
    for (var i = low; i < high; ++i) {
      ret.push(i);
    }
    return ret;
  };
  
  $scope.conditional = function(b, t, f) {
    return b ? t : f;
  };

  var addLooks = function(looks) {
    var row = 0;
    for (var i = 0; i < looks.length; ++i) {
      $scope.columns[$scope.looks.length % $scope.numColumns].push(looks[i]);
      $scope.looks.push(looks[i]);
    }
  };
  
  $scope.computeHeight = function(look, width) {
    return look.size.height * (width / look.size.width);
  };

  $scope.init = function(looks, numPages, currentPage, numColumns) {
    $scope.numPages = numPages;
    $scope.currentPage = currentPage;
    $scope.nextPage = currentPage + 1;
    $scope.numColumns = numColumns;

    for (var i = 0; i < numColumns; ++i) {
      $scope.columns.push([]);
    }
    
    addLooks(looks);
  };
  
  $scope.loadNextPage = function() {
    if ($scope.nextPage < $scope.numPages) {
      ++$scope.nextPage;
      $http.get('/all?p=' + $scope.nextPage, { headers : { accept : 'application/json' } })
          .success(
            function(data) {
              addLooks(data.looks);
            });
    }
  };
  
}
