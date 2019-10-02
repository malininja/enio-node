function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';    

    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
};

/* START URL specific functions */

var nsUrl = namespace("ninjaSoftware.url");

nsUrl.getParameterValue = function (parameterName) {
    parameterName = parameterName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + parameterName + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return results[1];
};

nsUrl.setParameters = function (params, openInNewWindow) {
    var queryParameters = {};
    var queryString = location.search.substring(1);
    var re = /([^&=]+)=([^&]*)/g, m;

    while (m = re.exec(queryString)) {
        queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    $.each(params, function (key, value) {
        queryParameters[key] = value;
    });

    if (openInNewWindow) {
        window.open(window.location.pathname + "?" + $.param(queryParameters));
    }
    else {
        location.search = $.param(queryParameters);
    }
};

/* END URL specific functions */

/* START HTML element specific functions */

var nsHtmlInput = namespace("ninjaSoftware.htmlInput");

nsHtmlInput.submitAsRedirect = function (submitId, redirectUrl) {
    $(document).ready(function () {
        $("#" + redirectUrl).click(function (e) {
            e.preventDefault();
            window.location.href = redirectUrl;
        });
    });
};

/* END HTML element specific functions */

/* START AngularJs specific functions*/ 

var nsAngular = namespace("ninjaSoftware.angularjs");

nsAngular.safeApply = function ($scope, fn) {
	var phase = $scope.$root.$$phase;
	
	if (phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
			fn();
		}
	}
	else {
		$scope.$apply(fn);
	}
};

nsAngular.isObjectExist = function (item) {
	if (item != null) {
		return item.toString().trim().length > 0;
	}
	else {
		return false;
	}
};

/* END AngularJs specific functions */

/* START js validation */

var nsValidation = namespace("ninjaSoftware.validation");

nsValidation.isNumeric = function (input) {
    return !isNaN(parseFloat(input)) && isFinite(input);
};

nsValidation.isHrNumeric = function (input) {
	if (input != null) {
		input = input.toString().replace(",", ".");
		return nsValidation.isNumeric(input);
	} else {
		return input;
	}
};
/* END js validation */

/* START AJAX helpers */

var nsAjaxHelper = namespace("ninjaSoftware.ajaxHelper");

// params{ url, jsonObject, success, error }
nsAjaxHelper.postJson = function (params) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: params.url,
        data: JSON.stringify(params.jsonObject),
        dataType: "json",
        success: function (result) {
            //alert("save");
            params.success(result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            params.error(XMLHttpRequest, textStatus, errorThrown);
        },
        async: false,
        cache: false
    });
};

// params { url, data, success, error }
nsAjaxHelper.getJson = function (params) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: params.url,
        data: params.data,
        success: function (result) {
            //alert("load");
            params.success(result);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            params.error(XMLHttpRequest, textStatus, errorThrown);
        },
        async: false,
        cache: false
    });
};

/* START AJAX helpers */


/* START format number */

var nsFormatNo = namespace("ninjaSoftware.formatNo");

nsFormatNo.toHrNoFormat = function (collection, memberToFormat) {
	if (collection) {
		for (i = 0; i < collection.length; i++) {
			var parsedValue = parseFloat(collection[i][memberToFormat]);
			collection[i][memberToFormat] = parsedValue.toFixed(2).replace(".", ",");
		}
	}
	
	return collection;
};

nsFormatNo.toHrCurrencyFormat = function (hrNo) {
    if (nsValidation.isHrNumeric(hrNo)) {
		var enNo = hrNo.toString().replace(",", ".");
		var parsedValue = parseFloat(enNo);
		return parsedValue.toFixed(2).replace(".", ",");
	}
	
	return null;
}

/* END format number */

/* START PARSER helpers */

var nsParser = namespace("ninjaSoftware.parser");

nsParser.parseHrFloat = function (numberString) {
	var enNo = numberString.toString().replace(",", ".");
	return parseFloat(enNo);
}

/* START PARSER helpers */

/* START DATE helpers*/

var nsDate = namespace("ninjaSoftware.date");

nsDate.getDateString = function (date) {
	var dd = date.getDate();
	if (dd < 10) {
		dd = "0" + dd;
	}
	
	var mm = date.getMonth() + 1;
	if (mm < 10) {
		mm = "0" + mm;
	}
	
	var yyyy = date.getFullYear();
	
	var dateString = dd + "." + mm + "." + yyyy;
	
	return dateString;
};

/* END DATE helpers*/