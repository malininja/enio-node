app.controller("ConfigController", ["$scope", function ($scope) {
    var _me = {};

    $scope.config = {};

    $scope.loadConfig = function () {
        var config = enioNg.api.config.get();

        if (config) {
            var fn = function () {
                $scope.config = config;
            }

            ninjaSoftware.angularjs.safeApply($scope, fn);
            $(document).trigger("ConfigIsLoaded");
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.saveConfig = function () {
        if ($scope.validation.isValid()) {
            var isSaved = enioNg.api.config.save($scope.config);

            if (isSaved) {
                $(document).trigger("ConfigIsSaved");
                $scope.loadConfig();
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadConfig();

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isAktivnaGodinaValid();
    };

    $scope.validation.isAktivnaGodinaValid = function () {
        var godina = $scope.config.AktivnaGodina;

        if (ninjaSoftware.validation.isNumeric(godina)) {
            if (godina >= 2005 && godina <= 2025) {
                return true;
            }
        }

        return false;
    };

    return _me;
}]);
