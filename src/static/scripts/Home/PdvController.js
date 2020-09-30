app.controller("PdvController", ["$scope", function ($scope) {
    var _me = {};

    $scope.selectedPdv = {};

    $scope.newPdv = function () {
        var fn = function () {
            $scope.selectedPdv = {};
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    $scope.save = function () {
        if ($scope.validation.isValid()) {
            $scope.selectedPdv.stopa = $scope.selectedPdv.stopa.toString();

            var isSaved = enioNg.api.pdv.save($scope.selectedPdv);

            if (isSaved === true) {
                $scope.newPdv();
                $(document).trigger("PdvIsSaved");
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadPdv = function (pdvId) {
        var pdv = enioNg.api.pdv.getById(pdvId);

        if (pdv) {
            var fn = function () {
                pdv.stopa = ninjaSoftware.formatNo.toHrCurrencyFormat(pdv.stopa);
                $scope.selectedPdv = pdv;
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isNazivValid() &&
            $scope.validation.isNazivExist() &&
            $scope.validation.isStopaValid();
    };

    $scope.validation.isNazivValid = function () {
        if ($scope.selectedPdv.naziv) {
            return $scope.selectedPdv.naziv.trim().length < 129;
        } else {
            return true;
        }
    };

    $scope.validation.isNazivExist = function () {
        if ($scope.selectedPdv.naziv) {
            return $scope.selectedPdv.naziv.trim().length > 0;
        } else {
            return false;
        }
    };

    $scope.validation.isStopaValid = function () {
        if (ninjaSoftware.validation.isHrNumeric($scope.selectedPdv.stopa)) {
            var stopa = ninjaSoftware.parser.parseHrFloat($scope.selectedPdv.stopa);
            return (stopa >= 0 && stopa < 100);
        } else {
            return false;
        }
    };

    return _me;
}]);
