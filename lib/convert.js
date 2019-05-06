'use strict';

// this file is used by controller when build uploads
function stringify(name, data, isConvert, files) {
    if (isConvert && name.match(/vis-views\.json$/)) {
        const parts = name.split('/');
        const project = parts.shift();
        data = data.toString();
        // detect: /vis/, /vis.0/, /icon-blabla/, ...
        let m = data.match(/": "\/[-_0-9\w]+(\.[-_0-9\w]+)?\/.+\.(png|jpg|jpeg|gif|wav|mp3|bmp|svg)+"/g);
        if (m) {
            for (let mm = 0; mm < m.length; mm++) {
                let fn = m[mm].substring(5); // remove ": "/
                const originalFileName = fn.replace(/"/g, ''); // remove last "
                const p  = fn.split('/');
                const adapter = p.shift(); // remove vis.0 or whatever
                const _project = p.length > 1 ? p.shift() : '';
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
            for (let mm = 0; mm < m.length; mm++) {
                let fn = m[mm].substring(7); // remove src=\"/
                const originalFileName = fn.replace(/\\"/g, ''); // remove last "
                const p  = fn.split('/');
                const adapter = p.shift(); // remove vis.0 or whatever
                const _project = p.length > 1 ? p.shift() : '';
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
            for (let mm = 0; mm < m.length; mm++) {
                let fn = m[mm].substring(6); // remove src="/
                const originalFileName = fn.replace(/'/g, ''); // remove last "
                const p  = fn.split('/');
                const adapter = p.shift(); // remove vis.0 or whatever
                const _project = p.length > 1 ? p.shift() : '';
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
            for (let t = 0; t < m.length; t++) {
                data = data.replace(m[t], '.ABC' + Math.round(Math.random() * 1000000) + '.');
            }
        }
        // try to replace 12.13.14.15
        data = data.replace(/\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}\//g, '//127.0.0.1/');

        // try to replace http://user:pass@address/
        data = data.replace(/((http|https):\/\/)?([-\w0-9_.]+?):([-\w0-9_*.]+)?@[-\w0-9.]+\//g, '//127.0.0.1/');
    }
    return data;
}

function parse(projectName, fileName, data, settings) {
    if (fileName.match(/vis-views\.json$/)) {
        // Check if all images are in the right directory
        let project = projectName;
        if (project[project.length - 1] === '/') {
            project = project.substring(0, project.length - 1);
        }
        data = data.toString();

        // detect: "/vis.0/project/picture.png"
        data = data.replace(/"\/vis.0\/([-_0-9\w]+)\//g, '"/vis.0/' + project + '/');
        data = data.replace(/'\/vis.0\/([-_0-9\w]+)\//g, "'/vis.0/" + project + '/');
    }
    return data;
}
module.exports.stringify = stringify;
module.exports.parse     = parse;