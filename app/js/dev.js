(function(){

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
    }

    if(getQueryVariable('dev')){
        var script = document.createElement('script');
        script.src = 'http://' + window.location.hostname + ':35729/livereload.js';
        document.getElementsByTagName('html')[0].appendChild(script);
    }
}());