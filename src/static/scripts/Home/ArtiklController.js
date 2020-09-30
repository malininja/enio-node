app.controller("ArtiklController", ["$scope", function ($scope) {
    var _me = {};

    $scope.selectedArtikl = {};

    $scope.newArtikl = function () {
        var fn = function () {
            $scope.selectedArtikl = {};
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    $scope.isSelectedArtiklNew = function () {
        if ($scope.selectedArtikl &&
			$scope.selectedArtikl.id &&
			$scope.selectedArtikl.id > 0) {
            return false;
        } else {
            return true;
        }
    };

    $scope.save = function () {
        if ($scope.validation.isValid()) {

            $scope.selectedArtikl.cijena = $scope.selectedArtikl.cijena.toString();

            var isSaved = enioNg.api.artikl.save($scope.selectedArtikl);

            if (isSaved === true) {
                $scope.newArtikl();
                $(document).trigger("ArtiklIsSaved");
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadArtikl = function (artiklId) {
        var artikl = enioNg.api.artikl.getById(artiklId);

        if (artikl) {
            var fn = function () {
                artikl.cijena = ninjaSoftware.formatNo.toHrCurrencyFormat(artikl.cijena);
                $scope.selectedArtikl = artikl;
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.pdvCollection = [];

    _me.loadPdvCollection = function () {
        var pdvCollection = enioNg.api.pdv.getAll();

        if (pdvCollection) {
            var fn = function () {
                $scope.pdvCollection = pdvCollection.rows;
            }

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    _me.loadPdvCollection();

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isJmValid() &&
			$scope.validation.isJmExist() &&
			$scope.validation.isNazivValid() &&
			$scope.validation.isNazivExist() &&
			$scope.validation.isCijenaValid() &&
			$scope.validation.isCijenaExist();
    };


    $scope.validation.isJmValid = function () {
        if ($scope.selectedArtikl.jm) {
            return $scope.selectedArtikl.jm.trim().length < 11;
        }
        else {
            return true;
        }
    };

    $scope.validation.isJmExist = function () {
        return ninjaSoftware.angularjs.isObjectExist($scope.selectedArtikl.jm);
    };

    $scope.validation.isNazivValid = function () {
        if ($scope.selectedArtikl.naziv) {
            return $scope.selectedArtikl.naziv.trim().length < 101;
        } else {
            return true;
        }
    };

    $scope.validation.isNazivExist = function () {
        return ninjaSoftware.angularjs.isObjectExist($scope.selectedArtikl.naziv);
    };

    $scope.validation.isCijenaValid = function () {
        return ninjaSoftware.validation.isHrNumeric($scope.selectedArtikl.cijena);
    }

    $scope.validation.isCijenaExist = function () {
        return ninjaSoftware.angularjs.isObjectExist($scope.selectedArtikl.cijena);
    };

    $scope.validation.isPdvExist = function () {
        return ninjaSoftware.angularjs.isObjectExist($scope.selectedArtikl.pdv_id);
    }

    return _me;
}]);