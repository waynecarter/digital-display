var config = {
    url: "http://localhost:4984/gate-display",
    
    getChannels: function()
    {
        var airport = this._getQueryParameter("airport");
        var gate = this._getQueryParameter("gate");

        var channels;
        if (airport && gate) {
            channels = ["airport." + airport.toLowerCase() + ".gate." + gate.toLowerCase()];
        }

        return channels;
    },
    
    _getQueryParameter: function(name)
    {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
        var results = regex.exec(url);

        if (!results) {
            return null;
        } else if (!results[2]) {
            return "";
        }

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
};