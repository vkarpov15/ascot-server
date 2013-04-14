/**
 *  LooksListController.test.js
 *
 *  Created on: April 5, 2013
 *      Author: Valeri Karpov
 *
 *  Test for LooksListController
 *
 */

describe('LooksListController', function() {
  var scope, v, $httpBackend;

  beforeEach(inject(function($injector, $rootScope, $controller) {
    $httpBackend = $injector.get('$httpBackend');
    scope = $rootScope.$new();

    v = $controller(LooksListController,
        { $scope : scope });
  }));
  
  it('should init all parameters', function() {
    scope.init([{ size : { height : 10, width : 10 } }], 1, 0, 1, 10);

    expect(scope.looks.length).toBe(1);
    expect(scope.numPages).toBe(1);
    expect(scope.currentPage).toBe(0);
    expect(scope.numColumns).toBe(1);
    expect(scope.columnWidth).toBe(10);
  });
});
