var CouchbaseDocumentChangeListener = function(
         url /* string */,
    channels /* string[] */)
{
    this.url = url;           // string
    this.channels = channels; // string[]
    this.onStart = null;      // void function()
    this.onStop = null;       // void function()
    this.listeners = [];      // Array<function (handler, filter)>

    this._http = new XMLHttpRequest();
    this._lastSeq = null;
    this._timeoutVariable = null;
    this._dirty = false;
}

CouchbaseDocumentChangeListener.prototype.addListener = function(
    handler /* void function(doc) */,
     filter /* boolean function(doc) */)
{
    this.listeners.push({handler:handler, filter:filter});
}

CouchbaseDocumentChangeListener.prototype.start = function()
{
    this._run();

    if (this.onStart) this.onStart();
}

CouchbaseDocumentChangeListener.prototype.stop = function()
{
    this._stop();
    this._lastSeq = null;
    
    if (this.onStop) this.onStop();
}

CouchbaseDocumentChangeListener.prototype._stop = function()
{
    clearTimeout(this._timeoutVariable);
    this._http.abort();
}

CouchbaseDocumentChangeListener.prototype._run = function()
{
    this._stop();

    var _this = this;
    // The listeners are explicitly immutable during a run loop. Any listeners
    // added during a run will be picked up on the next loop.
    var _listeners = this.listeners.slice();
    this._http.onreadystatechange = function()
    {
        if (_this._http.readyState == 4) {
            var status = _this._http.status;

            if (status == 200) {
                var responseText = _this._http.responseText;
                
                if (responseText && responseText.length > 0) {
                    var response = null;
                    try {
                        response = JSON.parse(responseText);
                    } catch (e) {
                        // When a parse fails set our state to dirty. This ensures we will
                        // invalidate correctly once whatever caused this is resolved. This
                        // is only expected during an abrupt _changes feed disconnect.
                        _this._setDirty();
                    }

                    if (response) {
                        var results = response.results;

                        if (results) {
                            var uncalledListeners = _listeners.slice();

                            for (var i=0; i<results.length; i++) {
                                var doc = results[i].doc;

                                if (doc) {
                                    for (var j=0; j<_listeners.length; j++) {
                                        var listener = _listeners[j];

                                        if (!listener.filter || listener.filter(doc)) {
                                            listener.handler(doc);
                                            uncalledListeners[j] = null;
                                        }
                                    }
                                }
                            }

                            // If we are dirty (i.e. the data we provided before isn't guarenteed to still
                            // be valid) then call all uncalled listeners w/ an "invalidated" doc so that
                            // they can react appropriately (e.g. clear UI elements).
                            if (_this._dirty) {
                                _this._dirty = false;

                                for (var i=0; i<uncalledListeners.length; i++) {
                                    var listener = uncalledListeners[i];
                                    var doc = {"_invalidated":true};
                                    
                                    if (listener && (!listener.filter || listener.filter(doc))) {
                                        listener.handler(doc);
                                    }
                                }
                            }
                        }

                        _this._lastSeq = response.last_seq;
                    }
                }
            } else if (status < 100 || (status > 399 && status < 600)) {
                // When a call fails set our state to dirty. This ensures we will
                // invalidate correctly following errors.
                _this._setDirty();
            }

            // If we are dirty wait 1000ms otherwise execute immediatly.  This
            // ensures that during an error state we don't make calls in a tight
            // loop.
            var wait = (_this._dirty ? 1000 : 0);
            _this._timeoutVariable = setTimeout(function()
            {
                _this._run();
            }, wait);
        }
    };

    var url = this.url;
    url += "/_changes?include_docs=true&feed=longpoll&style=main_only&active_only=true";
    if (this._lastSeq) {
        url += "&since=" + this._lastSeq;
    }
    if (this.channels && this.channels.length > 0) {
        url += "&filter=sync_gateway/bychannel&channels=" + this.channels.join(",");
    }

    this._http.open("GET", url);
    this._http.send();
}

CouchbaseDocumentChangeListener.prototype._setDirty = function()
{
    this._lastSeq = null;
    this._dirty = true;
}