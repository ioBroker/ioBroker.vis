import { join } from 'node:path';

// io-package.json > common.serviceStates: "lib/states.js" (see lib/states.js) delivers the number of
// used data points per project: vis.<instance>.datapoints.<project> and vis.<instance>.datapoints.total

interface ServiceState {
    id: string;
    val: number;
}

type FileCallback = (err: Error | null | undefined, data?: Buffer | string) => void;
type ReadDirCallback = (err: Error | null | undefined, entries?: { file: string; isDir: boolean }[]) => void;

interface ObjectsClient {
    readFile(id: string, name: string, callback: FileCallback): void;
    readDir(id: string, name: string, callback: ReadDirCallback): void;
}

type ResultCallback = (err: Error | null | undefined, result?: ServiceState[]) => void;

// visUtils.js is shared with the browser, the adapter directory is two levels higher (build/lib)
const { getUsedObjectIDs } = require(join(__dirname, '..', '..', 'www', 'js', 'visUtils')) as {
    getUsedObjectIDs: (views: Record<string, unknown>, isByViews: boolean) => { IDs?: string[] } | null;
};

function calcProject(
    objects: ObjectsClient,
    projects: { file: string; isDir: boolean }[],
    instance: number | string,
    result: ServiceState[] | null,
    callback: ResultCallback,
): void {
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
    objects.readFile(`vis.${instance}`, `/${project.file}/vis-views.json`, (err, data) => {
        let json: Record<string, unknown>;
        try {
            json = JSON.parse(data as string);
        } catch {
            console.error(`Cannot parse "/${project.file}/vis-views.json`);
            setImmediate(calcProject, objects, projects, instance, result, callback);
            return;
        }
        const dps = getUsedObjectIDs(json, false);
        if (dps && dps.IDs) {
            result.push({
                id: `vis.${instance}.datapoints.${project.file.replace(/[.\\s]/g, '_')}`,
                val: dps.IDs.length,
            });
        }
        setImmediate(calcProject, objects, projects, instance, result, callback);
    });
}

function calcProjects(
    objects: ObjectsClient,
    _states: unknown,
    instance: number | string,
    _config: unknown,
    callback?: ResultCallback,
): void {
    objects.readDir(`vis.${instance}`, '/', (err, projects) => {
        if (err || !projects || !projects.length) {
            callback && callback(err || null, [{ id: `vis.${instance}.datapoints.total`, val: 0 }]);
        } else {
            calcProject(objects, projects, instance, [], (err, result) => {
                if (result && result.length) {
                    let total = 0;
                    for (let r = 0; r < result.length; r++) {
                        total += result[r].val;
                    }
                    result.push({ id: `vis.${instance}.datapoints.total`, val: total });
                }

                callback && callback(err, result);
            });
        }
    });
}

export = calcProjects;
