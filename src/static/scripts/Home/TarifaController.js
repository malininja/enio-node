app.controller("TarifaController", ["$scope", function ($scope) {
    var _me = {};

    $scope.selectedTarifa = {};

    $scope.newTarifa = function () {
        var fn = function () {
            $scope.selectedTarifa = {};
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    $scope.isSelectedTarifaNew = function () {
        if ($scope.selectedTarifa &&
            $scope.selectedTarifa.id &&
            $scope.selectedTarifa.id > 0) {
            return false;
        } else {
            return true;
        }
    };

    $scope.save = function () {
        if ($scope.validation.isValid()) {
            var isSaved = enioNg.api.tarifa.save($scope.selectedTarifa);

            if (isSaved === true) {
                $scope.newTarifa();
                $(document).trigger("TarifaIsSaved");
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadTarifa = function (id) {
        var tarifa = enioNg.api.tarifa.getById(id);

        if (tarifa) {
            var fn = function () {
                tarifa.stopa = ninjaSoftware.formatNo.toHrCurrencyFormat(tarifa.stopa);
                $scope.selectedTarifa = tarifa;
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isNazivValid() &&
            $scope.validation.isStopaValid();
    };

    $scope.validation.isNazivExist = function () {
        return ninjaSoftware.angularjs.isObjectExist($scope.selectedTarifa.naziv);
    };

    $scope.validation.isNazivValid = function () {
        if ($scope.selectedTarifa.naziv) {
            return $scope.selectedTarifa.naziv.trim().length < 101;
        } else {
            return true;
        }
    };

    $scope.validation.isStopaValid = function () {
        if (ninjaSoftware.validation.isHrNumeric($scope.selectedTarifa.stopa)) {
            var stopa = ninjaSoftware.parser.parseHrFloat($scope.selectedTarifa.stopa);
            return stopa >= 0 && stopa < 100;
        } else {
            return false;
        }
    };
}]);
