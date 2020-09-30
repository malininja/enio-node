app.controller("FirmaController", ["$scope", function ($scope) {
    var _me = {};

    $scope.firma = {};

    $scope.loadFirma = function () {
        var firma = enioNg.api.firma.get();

        if (firma) {
            var fn = function () {
                $scope.firma = firma;
            }

            ninjaSoftware.angularjs.safeApply($scope, fn);
            $(document).trigger("FirmaIsLoaded");
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.saveFirma = function () {
        if ($scope.validation.isValid()) {
            var isSaved = enioNg.api.firma.save($scope.firma);

            if (isSaved) {
                $(document).trigger("FirmaIsSaved");
                $scope.loadFirma();
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadFirma();

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isAktivnaGodinaValid();
    };

    $scope.validation.isAktivnaGodinaValid = function () {
        var godina = $scope.firma.aktivna_godina;

        if (ninjaSoftware.validation.isNumeric(godina)) {
            if (godina >= 2005 && godina <= 2025) {
                return true;
            }
        }

        return false;
    };

    return _me;
}]);
