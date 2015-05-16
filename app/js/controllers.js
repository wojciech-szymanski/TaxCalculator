'use strict';

/* Controllers */

var taxApp = angular.module('taxApp', []);

taxApp.controller('taxCalculator', ['$scope', '$timeout', 'general',
  function($scope, $timeout, general) {

    /**
     * @name incomeForeignMonth
     * @description  Variable returning a sample month for specifying foreign income. Required to make sure angular does not define it as part of model
     * @memberOf taxCalculator
     * @function
     * @returns {object}
     */
    var incomeForeignMonth = function() {
      return {
        user_data : {
          days: 0,
          salary: 0.00,
          exchange_rate: 0.00
        },
        taxable: 0.00,
        pln_amount: 0.00
      }
    };

    /**
     * @name config
     * @description  Object defining the static data needed for tax calcualtion (e.g. tax rates in PL)
     * @memberOf taxCalculator
     */
    $scope.config = {
      tax_free: 556.02,
      tax_rate_1: 0.18,
      tax_threshold: 85528,
      tax_rate_2: 0.32,
      daily_allowance_weight: 0.3,
      income_cost: 139.06
    };

    /**
     * @name user_data
     * @description  Object defining the data to be entered by the user, includes array for specifying foreign income by month
     * @memberOf taxCalculator
     */
    $scope.user_data = {
      income_pl_base: 0.00,
      insurance_pl: 0.00,
      health_pl: 0.00,
      paid_tax: 0,
      foreign_daily_allowance: 0,
      income_foreign: []
    };

    /**
     * @name totals
     * @description  Object defining the data to be calculated on different stages of the process
     * @memberOf taxCalculator
     */
    $scope.totals = {
      /**
      * @name income_pl
      * @description  Returns the income from PL deducted by paid insurance (needed as starting point to calculate tax)
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get income_pl() {
        return general.toFixed($scope.user_data.income_pl_base - $scope.user_data.insurance_pl);
      },
      /**
      * @name income_foreign
      * @description  Returns the total sum of taxable amounts from all the months specified in foreign income
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get income_foreign() {
        return general.totalSum($scope.user_data.income_foreign, "taxable");
      },
      /**
      * @name income_foreign_to_pln
      * @description  Returns the total sum of income converted to PLN from all the months specified in foreign income
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get income_foreign_to_pln() {
        return general.totalSum($scope.user_data.income_foreign, "pln_amount"); 
      },
      /**
      * @name combined_income
      * @description  Returns the total sum of PLN and foreign income converted to PLN
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get combined_income() {
        return general.toFixed($scope.totals.income_pl + $scope.totals.income_foreign_to_pln);
      },
      /**
      * @name tax_base
      * @description  Returns the amount of tax needed to be paid for the combined income
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get tax_base() {
        if ($scope.totals.combined_income > $scope.config.tax_threshold) {
          return $scope.config.tax_threshold * $scope.config.tax_rate_1 + ($scope.totals.combined_income - $scope.config.tax_threshold) * $scope.config.tax_rate_2;
        } else {
          return $scope.totals.combined_income * $scope.config.tax_rate_1;
        }
      },
      /**
      * @name new_tax_rate
      * @description  Returns the new combined tax rate calculated from the tax base from the combined income or 0 if no income speicifed yet
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get new_tax_rate() {
        return $scope.totals.combined_income ? general.toFixed(($scope.totals.tax_base - $scope.config.tax_free) * 100 / $scope.totals.combined_income) : 0;
      },
      /**
      * @name tax_to_pay
      * @description  Returns the amount of tax that is left to be paid
      * @memberOf taxCalculator.totals
      * @function
      * @returns {number}
      */
      get tax_to_pay() {
        return general.toFixed($scope.totals.income_pl * $scope.totals.new_tax_rate / 100 - $scope.user_data.health_pl - $scope.user_data.paid_tax) || 0;
      }
    };

    /**
     * @name calculateTaxable
     * @description  Calculates the taxable amount in foreign currency and converted amount in PLN
     * @memberOf taxCalculator
     * @function
     * @returns null
     */
    $scope.calculateTaxable = function(month) {
      month.taxable = month.user_data.salary - general.toFixed(month.user_data.days * $scope.user_data.foreign_daily_allowance * $scope.config.daily_allowance_weight);
      month.pln_amount = general.toFixed((month.taxable * month.user_data.exchange_rate) - $scope.config.income_cost);
    };

    /**
     * @name calculateAll
     * @description  Calculates all foreign income when global config changed (e.g. daily allowance)
     * @memberOf taxCalculator
     * @function
     * @returns null
     */
    $scope.calculateAll = function() {
      angular.forEach($scope.user_data.income_foreign, function(month) {
        $scope.calculateTaxable(month);
      });
    };

    /**
     * @name addMonth
     * @description  Adds a new month into foreign income array
     * @memberOf taxCalculator
     * @function
     * @returns null
     */
    $scope.addMonth = function() {
      $scope.user_data.income_foreign.push(incomeForeignMonth());
    };

  }
]);