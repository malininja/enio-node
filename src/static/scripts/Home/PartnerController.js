app.controller("PartnerController", ["$scope", function ($scope) {
    var _me = {};

    $scope.selectedPartner = {};

    $scope.newPartner = function () {
        var fn = function () {
            $scope.selectedPartner = {};
            $scope.selectedPartner.valuta = 15;
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    $scope.isSelectedPartnerNew = function () {
        if ($scope.selectedPartner &&
			$scope.selectedPartner.id &&
			$scope.selectedPartner.id > 0) {
            return false;
        }
        else {
            return true;
        }
    };

    $scope.save = function () {
        if ($scope.validation.isValid()) {
            var isSaved = enioNg.api.partner.save($scope.selectedPartner);

            if (isSaved === true) {
                $scope.newPartner();
                $(document).trigger("PartnerIsSaved");
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    $scope.loadPartner = function (id) {
        var partner = enioNg.api.partner.getById(id);

        if (partner) {
            var fn = function () {
                $scope.selectedPartner = partner;
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
			$scope.validation.isOibValid() &&
			$scope.validation.isAdresaValid() &&
			$scope.validation.isMjestoValid() &&
			$scope.validation.isPostaValid() &&
			$scope.validation.isValutaValid();
    };

    $scope.validation.isNazivValid = function () {
        if ($scope.selectedPartner.naziv) {
            return $scope.selectedPartner.naziv.trim().length < 101;
        }
        else {
            return true;
        }
    };

    $scope.validation.isNazivExist = function () {
        if ($scope.selectedPartner.naziv) {
            return $scope.selectedPartner.naziv.trim().length > 0;
        }
        else {
            return false;
        }
    };

    $scope.validation.isOibValid = function () {
        if ($scope.selectedPartner.oib) {
            var oibLength = $scope.selectedPartner.oib.trim().length;
            return oibLength === 11 || oibLength === 0;
        }
        else {
            return true;
        }
    };

    $scope.validation.isAdresaValid = function () {
        if ($scope.selectedPartner.adresa) {
            return $scope.selectedPartner.adresa.trim().length < 101;
        }
        else {
            return true;
        }
    };

    $scope.validation.isMjestoValid = function () {
        if ($scope.selectedPartner.mjesto) {
            return $scope.selectedPartner.mjesto.trim().length < 21;
        }
        else {
            return true;
        }
    };

    $scope.validation.isPostaValid = function () {
        if ($scope.selectedPartner.posta) {
            return $scope.selectedPartner.posta.trim().length < 11;
        }
        else {
            return true;
        }
    };

    $scope.validation.isValutaValid = function () {
        if ($scope.selectedPartner.valuta) {
            return ($scope.selectedPartner.valuta >= 0 && $scope.selectedPartner.valuta < 65000);
        }
        else {
            return false;
        }
    }

    return _me;
}]);
