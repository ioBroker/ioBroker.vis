'use strict';

const getUsedObjectIDs = require('../www/js/visUtils').getUsedObjectIDs;

function calcProject(objects, projects, instance, result, callback) {
    if (!projects || !projects.length) {
        callback(null, result || []);
        return;
    }
    result = result || [];
    const project = projects.shift();
    if (!project || !project.isDir) {
        setImmediate(calcProject, objects, projects, instance, result, callback);
        return;
    }

    // calculate datapoints in one project
    objects.readFile('vis.' + instance, '/' + project.file + '/vis-views.json', (err, data) => {
        let json;
        try {
            json = JSON.parse(data);
        } catch (e) {
            console.error('Cannot parse "/' + project.file + '/vis-views.json');
            setImmediate(calcProject, objects, projects, instance, result, callback);
            return;
        }
        const dps = getUsedObjectIDs(json, false);
        if (dps && dps.IDs) {
            result.push({id: 'vis.' + instance + '.datapoints.' + project.file.replace(/[.\\s]/g, '_'), val: dps.IDs.length});
        }
        setImmediate(calcProject, objects, projects, instance, result, callback);
    });
}

function calcProjects(objects, states, instance, config, callback) {
    objects.readDir('vis.' + instance, '/', (err, projects) => {
        if (err || !projects || !projects.length) {
            callback && callback(err || null, [{id: 'vis.' + instance + '.datapoints.total', val: 0}]);
        } else {
            calcProject(objects, projects, instance, [], (err, result) => {
                if (result && result.length) {
                    let total = 0;
                    for (let r = 0; r < result.length; r++) {
                        total += result[r].val;
                    }
                    result.push({id: 'vis.' + instance + '.datapoints.total', val: total});
                }

                callback && callback(err, result);
            });
        }
    });
}

module.exports = calcProjects;