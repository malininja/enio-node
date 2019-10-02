app.controller("PartnerController", ["$scope", function ($scope) {
    var _me = {};

    $scope.selectedPartner = {};

    $scope.newPartner = function () {
        var fn = function () {
            $scope.selectedPartner = {};
            $scope.selectedPartner.Valuta = 15;
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    $scope.isSelectedPartnerNew = function () {
        if ($scope.selectedPartner &&
			$scope.selectedPartner.PartnerId &&
			$scope.selectedPartner.PartnerId > 0) {
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

    $scope.loadPartner = function (partnerId) {
        var partner = enioNg.api.partner.getById(partnerId);

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
        if ($scope.selectedPartner.Naziv) {
            return $scope.selectedPartner.Naziv.trim().length < 101;
        }
        else {
            return true;
        }
    };

    $scope.validation.isNazivExist = function () {
        if ($scope.selectedPartner.Naziv) {
            return $scope.selectedPartner.Naziv.trim().length > 0;
        }
        else {
            return false;
        }
    };

    $scope.validation.isOibValid = function () {
        if ($scope.selectedPartner.Oib) {
            var oibLength = $scope.selectedPartner.Oib.trim().length;
            return oibLength === 11 || oibLength === 0;
        }
        else {
            return true;
        }
    };

    $scope.validation.isAdresaValid = function () {
        if ($scope.selectedPartner.Adresa) {
            return $scope.selectedPartner.Adresa.trim().length < 101;
        }
        else {
            return true;
        }
    };

    $scope.validation.isMjestoValid = function () {
        if ($scope.selectedPartner.Mjesto) {
            return $scope.selectedPartner.Mjesto.trim().length < 21;
        }
        else {
            return true;
        }
    };

    $scope.validation.isPostaValid = function () {
        if ($scope.selectedPartner.Posta) {
            return $scope.selectedPartner.Posta.trim().length < 11;
        }
        else {
            return true;
        }
    };

    $scope.validation.isValutaValid = function () {
        if ($scope.selectedPartner.Valuta) {
            return ($scope.selectedPartner.Valuta >= 0 && $scope.selectedPartner.Valuta < 65000);
        }
        else {
            return false;
        }
    }

    return _me;
}]);
