'use strict';

/* Directives */
taxApp.directive('float', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                return isNaN(parseFloat(viewValue)) ? "" :  parseFloat(viewValue);
            });
        }
    };
});