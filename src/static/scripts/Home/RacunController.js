app.controller("RacunController", ["$scope", function ($scope) {
    var _me = {};

    var dateString = ninjaSoftware.date.getDateString(new Date());

    $scope.racunGlava = {
        datum: dateString,
        vrijeme: "12:00",
        je_pdv_racun: true,
        status_id: "2"
    };

    $scope.newRacunStavka = {};
    $scope.racunStavkaCollection = [];
    $scope.partnerCollection = [];
    $scope.tarifaCollection = [];
    $scope.statusCollection = [];
    $scope.artiklCollection = [];
    $scope.ukupniIznos = "0,00";
    _me.pdvCollection = [];

    $scope.loadRacun = function (racunGlavaId) {
        var racun = enioNg.api.racun.getById(racunGlavaId);

        if (racun) {
            var fn = function () {
                var datum = new Date(racun.racunGlava.datum);
                racun.racunGlava.datum = ninjaSoftware.date.getDateString(datum);
                $scope.racunGlava = racun.racunGlava;
                $scope.racunStavkaCollection = ninjaSoftware.formatNo.toHrNoFormat(racun.racunStavkaCollection, "kolicina");
                $scope.racunStavkaCollection = ninjaSoftware.formatNo.toHrNoFormat(racun.racunStavkaCollection, "cijena");
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
            $scope.calculateTotal();
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.save = function () {
        if ($scope.validation.isValid()) {
            var racunGlavaId = enioNg.api.racun.save({
                glava: $scope.racunGlava,
                stavke: $scope.racunStavkaCollection,
            });

            if (racunGlavaId) {
                alert(enioNg.textResources.dataSaveSuccess);
                window.location.href = "/home/racun-edit?racunGlavaId=" + racunGlavaId;
            } else {
                alert(enioNg.textResources.dataSaveError);
            }
        } else {
            alert(enioNg.textResources.validationError);
        }
    };

    _me.loadPartnerCollection = function () {
        var partnerCollection = enioNg.api.partner.getAll();

        if (partnerCollection) {
            var fn = function () {
                $scope.partnerCollection = partnerCollection.rows;
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    _me.loadTarifaCollection = function () {
        var tarifaCollection = enioNg.api.tarifa.getAll();

        if (tarifaCollection) {
            var fn = function () {
                if (tarifaCollection.rows.length > 0) {
                    $scope.tarifaCollection = tarifaCollection.rows;
                    $scope.racunGlava.tarifa_id = tarifaCollection.rows[0].id;
                }
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    _me.loadStatusCollection = function () {
        var fn = function () {
            $scope.statusCollection = [
                { code: "Paid", name: "Plaćen", id: "1" },
                { code: "Unpaid", name: "Neplaćen", id: "2" },
                { code: "Cancelled", name: "Storniran", id: "3" },
                { code: "WriteOff", name: "Otpis", id: "4" },
                { code: "Blockade", name: "Blokada", id: "5" },
            ];
        };

        ninjaSoftware.angularjs.safeApply($scope, fn);
    };

    _me.loadArtiklCollection = function () {
        var artiklCollection = enioNg.api.artikl.getAll();

        if (artiklCollection) {
            var fn = function () {
                $scope.artiklCollection = artiklCollection.rows;
            };

            ninjaSoftware.angularjs.safeApply($scope, fn);
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    _me.loadPdvCollection = function () {
        var pdvCollection = enioNg.api.pdv.getAll();

        if (pdvCollection) {
            _me.pdvCollection = pdvCollection.rows;
        } else {
            alert(enioNg.textResources.dataFetchError);
        }
    };

    $scope.validation = {};

    $scope.validation.isValid = function () {
        return $scope.validation.isPoslovnaGodinaValid();
    };

    $scope.validation.isPoslovnaGodinaValid = function () {
        Globalize.culture("hr");
        var date = Globalize.parseDate($scope.racunGlava.datum);
        var year = date.getFullYear();

        var firma = enioNg.api.firma.get();

        if (firma.aktivna_godina !== year) {
            alert("Datum računa nije u aktivnoj poslovnoj godini. Račun nije pohranjen.");
            return false;
        }

        return true;
    };

    $scope.calculateTotal = function () {
        var tarifaStopa;
        if ($scope.racunGlava.tarifa_stopa) {
            tarifaStopa = $scope.racunGlava.tarifa_stopa;
        } else {
            for (var i = 0; i < $scope.tarifaCollection.length; i++) {
                if ($scope.tarifaCollection[i].id === $scope.racunGlava.tarifa_id) {
                    tarifaStopa = $scope.tarifaCollection[i].stopa;
                }
            }
        }

        var total = 0;

        if ($scope.racunStavkaCollection.length > 0) {
            for (var i = 0; i < $scope.racunStavkaCollection.length; i++) {
                var racunStavka = $scope.racunStavkaCollection[i];
                var kolicina = ninjaSoftware.parser.parseHrFloat(racunStavka.kolicina);
                var cijena = ninjaSoftware.parser.parseHrFloat(racunStavka.cijena);

                var tarifaIznos = kolicina * cijena * tarifaStopa / 100;
                var pdvIznos = (kolicina * cijena + tarifaIznos) * racunStavka.pdv_posto / 100;
                var iznos = kolicina * cijena + tarifaIznos + pdvIznos;

                total = total + iznos;
            }
        }

        $scope.ukupniIznos = ninjaSoftware.formatNo.toHrCurrencyFormat(total);
    };

    _me.loadPartnerCollection();
    _me.loadTarifaCollection();
    _me.loadStatusCollection();
    _me.loadArtiklCollection();
    _me.loadPdvCollection();

    $scope.onArtiklChange = function () {
        var artikl;

        $($scope.artiklCollection).each(function (index, item) {
            if (item.id === $scope.newRacunStavka.artikl_id) {
                artikl = item;
            }
        });

        var pdv;

        $(_me.pdvCollection).each(function (index, item) {
            if (item.id === artikl.pdv_id) {
                pdv = item;
            }
        });

        $scope.newRacunStavka.artikl = artikl;
        $scope.newRacunStavka.artikl_id = artikl.id;
        $scope.newRacunStavka.kolicina = null;
        $scope.newRacunStavka.cijena = ninjaSoftware.formatNo.toHrCurrencyFormat(artikl.cijena);
        $scope.newRacunStavka.pdv_posto = pdv.stopa;

        $(document).trigger("ArtiklChanged");
    };

    $scope.onPartnerChange = function () {
        var partnerId = $scope.racunGlava.partner_id;

        for (var i = 0; i < $scope.partnerCollection.length; i++) {
            var partner = $scope.partnerCollection[i];

            if (partner.id === partnerId) {
                $scope.racunGlava.valuta = partner.valuta;
                break;
            }
        }
    };

    $scope.onTarifaChange = function () {
        var tarifaId = $scope.racunGlava.tarifa_id;

        for (var i = 0; i < $scope.tarifaCollection.length; i++) {
            var tarifa = $scope.tarifaCollection[i];

            if (tarifa.id === tarifaId) {
                $scope.racunGlava.tarifa_stopa = tarifa.stopa;
                break;
            }
        }

        $scope.calculateTotal();
    };

    $scope.addRacunStavka = function () {
        if (!$scope.newRacunStavka.artikl_id ||
            !$scope.racunForm.newStavkaKolicina.$valid ||
            !$scope.racunForm.newStavkaCijena.$valid) {
            //alert("nevalja!!!");
            return;
        }

        var existingObjects = $.grep($scope.racunStavkaCollection, function (e) { return e.artikl_id == $scope.newRacunStavka.artikl_id; });
        if (existingObjects.length > 0) {
            alert("Artikl je već dodan na račun.");
            return;
        }

        var pozicija = 0;
        var arrayLength = $scope.racunStavkaCollection.length;

        if (arrayLength) {
            pozicija = $scope.racunStavkaCollection[arrayLength - 1].pozicija + 1;
        }

        var stavka = {
            pozicija,
            artikl: $scope.newRacunStavka.artikl,
            artikl_id: $scope.newRacunStavka.artikl_id,
            kolicina: ninjaSoftware.formatNo.toHrCurrencyFormat($scope.newRacunStavka.kolicina),
            cijena: ninjaSoftware.formatNo.toHrCurrencyFormat($scope.newRacunStavka.cijena),
            pdv_posto: $scope.newRacunStavka.pdv_posto
        };

        $scope.racunStavkaCollection.push(stavka);
        $scope.calculateTotal();
    };

    $scope.deleteRacunStavka = function (pozicija) {
        $($scope.racunStavkaCollection).each(function (index, item) {
            if (item.pozicija === pozicija) {
                $scope.racunStavkaCollection.splice(index, 1);
                return false;
            }
        });

        $scope.calculateTotal();
    };

    $(document).trigger("RacunControlerLoaded", $scope);

    return _me;
}]);
