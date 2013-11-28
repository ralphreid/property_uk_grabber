/* jQueryIdjQuery
 *
 * This file is part of the Not-Zend Framework.
 * Copyright 2009, iWeb Solutions, http://www.iwebsolutions.co.uk
 *
 * @author Bas Mostert & Jon Ellis
 * @description
 */

(function(jQuery) {

    var rpc = function(ep, options) { //_onSuccess, _onError, _onTransportError) {
        var endpoint = ep;
        var id = 0;

		if (!(options && options.onError && jQuery.isFunction(options.onError))) {
			_onError = jQuery.rpc.defaults.onError;
		} else {
			_onError = options.onError;
		}

		if (!(options && options.onSuccess && jQuery.isFunction(options.onSuccess))) {
			_onSuccess = jQuery.rpc.defaults.onSuccess;
		} else {
			_onSuccess = options.onSuccess;
		}

		if (!(options && options.onTransportError && jQuery.isFunction(options.onTransportError))) {
			_onTransportError = jQuery.rpc.defaults.onTransportError;
		} else {
			_onTransportError = options.onTransportError;
		}

		if (!(options && options.blocking)) {
			_blocking = jQuery.rpc.defaults.blocking;
		} else {
			_blocking = options.blocking;
		}

        this.invoke = function(method, params, onSuccess, onError, onTransportError, blocking) {
            if (!jQuery.isFunction(onError)) {
                onError = _onError;
			}

            if (!jQuery.isFunction(onSuccess)) {
                onSuccess = _onSuccess;
			}

            if (!jQuery.isFunction(onTransportError)) {
                onTransportError = _onTransportError;
			}

            var data = {
                jsonrpc: '2.0',
                method: method,
                id: ++id
            };

            if (!(typeof(params) === 'undefined' || params === null)) {
                data.params = params;
			}
			
            var response = jQuery.ajax({
                url: endpoint,
                dataType: 'json',
                type: 'POST',
				async: !blocking,
                data: jQuery.toJSON(data),
				processData: false,
                contentType: 'application/json',
                success: function(json) {
                    if (typeof(json.result) === 'undefined' && typeof(json.error) !== 'undefined') {
                        onError(json.error)
					} else if (typeof(json.result) !== 'undefined' && typeof(json.error) === 'undefined') {
                        onSuccess(json.result);
					} else {
                        onTransportError('Server returned non-valid JSON-RPC message.');
					}
                },
                error: function(requestObject, textStatus, errorThrown) {
                    onTransportError(textStatus);
                }
            });

			if(blocking && response.responseText){
				try{
					json = jQuery.parseJSON(response.responseText);
					if (typeof(json.result) === 'undefined' && typeof(json.error) !== 'undefined'){
						onError(json.error);
					}else if(typeof(json.result) !== 'undefined' && typeof(json.error) === 'undefined'){
						return json.result;
					}else{
						onTransportError('Server returned non-valid JSON-RPC message.');
					}
				}catch(e){
					onTransportError(e);
				}
			}
        };
    };

    jQuery.rpc = function(endpoint, options) {
        return new rpc(endpoint, options);
    };

    jQuery.rpc.defaults = {
		blocking: false,
        onError: function(error) { alert('Error code '+error.code+': '+error.message); },
        onSuccess: function(data) { },
        onTransportError: function(text) {  }
    };
})(jQuery);