/*
Dependencies:
	- NinjaSoftwareLib.js
	- enioNg.textResources.js
*/

var enioNg = enioNg || {};
enioNg.api = enioNg.api || {};

enioNg.api.errorFn = function () {
	console.log(enioNg.textResources.ajaxErrorMessage);
};

// ARTIKL
enioNg.api.artikl = enioNg.api.artikl || {};

enioNg.api.artikl.getById = function (id) {
	var artikl;

	ninjaSoftware.ajaxHelper.getJson({
		url: `/api/artikl/${id}`,
		success: function (result) {
			artikl = result;
		},
		error: enioNg.api.errorFn
	});

	return artikl;
};

enioNg.api.artikl.save = function (artikl) {
	var isSaved = false;

	ninjaSoftware.ajaxHelper.postJson({
		url: "/api/artikl",
		jsonObject: artikl,
		success: function (result) {
			isSaved = result;
		},
		error: enioNg.api.errorFn
	});

	return isSaved;
};

enioNg.api.artikl.getAll = function () {
	var artiklCollection;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/artikl",
		success: function (result) {
			artiklCollection = result;
		},
		error: enioNg.api.errorFn
	});

	return artiklCollection;
};

// FIRMA
enioNg.api.firma = enioNg.api.firma || {};

enioNg.api.firma.get = function () {
	var firma;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/firma",
		success: function (result) {
			firma = result;
		},
		error: enioNg.api.errorFn
	});

	return firma;
};

enioNg.api.firma.save = function (firma) {
	var isSaved = false;

	ninjaSoftware.ajaxHelper.postJson({
		url: "/api/firma",
		jsonObject: firma,
		success: function (result) {
			isSaved = result;
		},
		error: enioNg.api.errorFn
	});

	return isSaved;
};

// PARTNER
enioNg.api.partner = enioNg.api.partner || {};

enioNg.api.partner.save = function (partner) {
	var isSaved = false;

	ninjaSoftware.ajaxHelper.postJson({
		url: "/api/partner",
		jsonObject: partner,
		success: function (result) {
			isSaved = result;
		},
		error: enioNg.api.errorFn
	});

	return isSaved;
};

enioNg.api.partner.getById = function (id) {
	var partner;

	ninjaSoftware.ajaxHelper.getJson({
		url: `/api/partner/${id}`,
		success: function (result) {
			partner = result;
		},
		error: enioNg.api.errorFn
	});

	return partner;
};

enioNg.api.partner.getAll = function () {
	var partnerCollection;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/partner",
		success: function (result) {
			partnerCollection = result;
		},
		error: enioNg.api.errorFn
	});

	return partnerCollection;
};

// PDV
enioNg.api.pdv = enioNg.api.pdv || {};

enioNg.api.pdv.getAll = function () {
	var pdvCollection;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/pdv",
		success: function (result) {
			pdvCollection = result;
		},
		error: enioNg.api.errorFn
	});

	return pdvCollection;
};

enioNg.api.pdv.save = function (pdv) {
	var isSaved = false;

	ninjaSoftware.ajaxHelper.postJson({
		url: `/api/pdv`,
		jsonObject: pdv,
		success: function (result) {
			isSaved = result;
		},
		error: enioNg.api.errorFn
	});

	return isSaved;
};

enioNg.api.pdv.getById = function (id) {
	var pdv;

	ninjaSoftware.ajaxHelper.getJson({
		url: `/api/pdv/${id}`,
		success: function (result) {
			pdv = result;
		},
		error: enioNg.api.errorFn
	});

	return pdv;
};

// RACUN
enioNg.api.racun = enioNg.api.racun || {};

enioNg.api.racun.getById = function (id) {
	var racun;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/racun/" + id,
		success: function (result) {
			racun = result;
		},
		error: enioNg.api.errorFn
	});

	return racun;
};

enioNg.api.racun.save = function (data) {
	var racunGlavaId;

	ninjaSoftware.ajaxHelper.postJson({
		url: "/api/racun",
		jsonObject: data,
		success: function (result) {
			racunGlavaId = result;
		},
		error: enioNg.api.errorFn
	});

	return racunGlavaId;
};

// STATUS
enioNg.api.status = enioNg.api.status || {};

enioNg.api.status.getAll = function () {
	var statusCollection;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/GetStatusCollection",
		success: function (result) {
			statusCollection = result;
		},
		error: enioNg.api.errorFn
	});

	return statusCollection;
};

// TARIFA
enioNg.api.tarifa = enioNg.api.tarifa || {};

enioNg.api.tarifa.save = function (tarifa) {
	var isSaved = false;

	ninjaSoftware.ajaxHelper.postJson({
		url: "/api/tarifa",
		jsonObject: tarifa,
		success: function (result) {
			isSaved = result;
		},
		error: enioNg.api.errorFn
	});

	return isSaved;
};

enioNg.api.tarifa.getById = function (id) {
	var tarifa;

	ninjaSoftware.ajaxHelper.getJson({
		url: `/api/tarifa/${id}`,
		success: function (result) {
			tarifa = result;
		},
		error: enioNg.api.errorFn
	});

	return tarifa;
};

enioNg.api.tarifa.getAll = function () {
	var tarifaCollection;

	ninjaSoftware.ajaxHelper.getJson({
		url: "/api/tarifa",
		success: function (result) {
			tarifaCollection = result;
		},
		error: enioNg.api.errorFn
	});

	return tarifaCollection;
};