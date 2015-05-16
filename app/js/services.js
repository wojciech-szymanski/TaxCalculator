'use strict';

/* Services */
taxApp.factory('general', function() {
	return {
    /**
     * @name toFixed
     * @description  Crops all the digits after 2 decimal places
     * @memberOf general
     * @function
     * @returns {number}
     */
		toFixed: function(value) {
      return Math.round(value * 100) / 100;
    },

    /**
     * @name totalSum
     * @description  Calculates total in a column for a given array
     * @memberOf general
     * @function
     * @returns {number}
     */
    totalSum: function(array, column) {
      var income = 0.00;
      angular.forEach(array, function(month) {
        income += month[column];
      });
      return this.toFixed(income);
    }

	}

});