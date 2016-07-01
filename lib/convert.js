// this file is used by controller when build uploads
function stringify(fileName, data, isConvert, files) {
    if (isConvert && fileName.match(/vis-views\.json$/)) {
        var parts = fileName.split('/');
        var project = parts.shift();
        // detect: "/vis.0/project/picture.png"
        var m = data.match(/\\"\/vis.0\/([-_0-9\w]+)\/.+\.[png|jpg|jpeg|gif|wav|mp3|bmp|svg]+\\"/g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                var fn = m[mm]; // remove ": "/
                data = data.replace(/"\/vis.0\/([-_0-9\w]+)\//, '"/vis.0/' + fileName + '/');
            }
        }
        // detect: "/vis.0/project/picture.png"
        var m = data.match(/\\'\/vis.0\/([-_0-9\w]+)\/.+\.[png|jpg|jpeg|gif|wav|mp3|bmp|svg]+\\'/g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                var fn = m[mm]; // remove ": "/
                data = data.replace(/'\/vis.0\/([-_0-9\w]+)\//, "'/vis.0/" + fileName + '/');
            }
        }
    }
    return data;
}

function parse(projectName, fileName, data, settings) {
    if (fileName.match(/vis-views\.json$/)) {
        // Check if all images are in the right directory
        var parts = fileName.split('/');
        var project = parts.shift();
        // detect: /vis/, /vis.0/, /icon-blabla/, ...
        var m = data.match(/": "\/[-_0-9\w]+(\.[-_0-9\w]+)?\/.+\.(png|jpg|jpeg|gif|wav|mp3|bmp|svg)+"/g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                var fn = m[mm].substring(5); // remove ": "/
                var originalFileName = fn.replace(/"/g, ''); // remove last "
                var p  = fn.split('/');
                var adapter = p.shift(); // remove vis.0 or whatever
                var _project = p.length > 1 ? p.shift() : '';
                fn  = p.length ? p.shift() : ''; // keep only one subdirectory
                fn += p.length ? '/' + p.join('/') : '';// all other subdirectories combine again

                if (adapter !== 'vis.0' || _project !== project) {
                    // add to files
                    if (files.indexOf(originalFileName) === -1) { // if "vis.0/dir/otherProject.png"
                        files.push(originalFileName);
                    }
                    data = data.replace(m[mm], '": "/vis.0/' + project + '/' + fn);
                }
            }
        }
        // try to replace <img src="/vis.0/main...">
        m = data.match(/src=\\"\/[-_0-9\w]+(\.[-_0-9\w]+)?\/.+\.(png|jpg|jpeg|gif|wav|mp3|bmp|svg)+\\"/g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                var fn = m[mm].substring(7); // remove src=\"/
                var originalFileName = fn.replace(/\\"/g, ''); // remove last "
                var p  = fn.split('/');
                var adapter = p.shift(); // remove vis.0 or whatever
                var _project = p.length > 1 ? p.shift() : '';
                fn  = p.length ? p.shift() : ''; // keep only one subdirectory
                fn += p.length ? '/' + p.join('/') : '';// all other subdirectories combine again

                if (adapter !== 'vis.0' || _project !== project) {
                    // add to files
                    if (files.indexOf(originalFileName) === -1) { // if "vis.0/dir/otherProject.png"
                        files.push(originalFileName);
                    }
                    data = data.replace(m[mm], 'src=\\"/vis.0/' + project + '/' + fn);
                }
            }
        }
        // try to replace <img src='/vis.0/main...'>
        m = data.match(/src='\/[-_0-9\w]+(\.[-_0-9\w]+)?\/.+\.(png|jpg|jpeg|gif|wav|mp3|bmp|svg)+'/g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                var fn = m[mm].substring(6); // remove src="/
                var originalFileName = fn.replace(/'/g, ''); // remove last "
                var p  = fn.split('/');
                var adapter = p.shift(); // remove vis.0 or whatever
                var _project = p.length > 1 ? p.shift() : '';
                fn  = p.length ? p.shift() : ''; // keep only one subdirectory
                fn += p.length ? '/' + p.join('/') : '';// all other subdirectories combine again

                if (adapter !== 'vis.0' || _project !== project) {
                    // add to files
                    if (files.indexOf(originalFileName) === -1) { // if "vis.0/dir/otherProject.png"
                        files.push(originalFileName);
                    }
                    data = data.replace(m[mm], "src='/vis.0/" + project + '/' + fn);
                }
            }
        }
        // try to replace <img src='/vis.0/main...'>
        m = data.match(/\.[A-Z]{3}\d{7}\./g);
        if (m) {
            for (var mm = 0; mm < m.length; mm++) {
                data = data.replace(m[mm], '.ABC' + Math.round(Math.random() * 1000000) + '.');
            }
        }
    }
    return data;
}
module.exports.stringify = stringify;
module.exports.parse     = parse;