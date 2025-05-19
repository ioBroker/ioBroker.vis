import React from 'react';
import {
    Blinds,
    DirectionsRun,
    Lightbulb,
    SensorDoor,
    Thermostat,
    VolumeUp,
    WbSunny,
    Whatshot,
    Water,
    Lock,
    Window as WindowIcon,
    Palette,
    PlayArrowRounded,
    Power,
    TipsAndUpdates,
    Tune,
    WaterDrop,
    QuestionMark,
} from '@mui/icons-material';

import { TbVacuumCleaner } from 'react-icons/tb';

import ChannelDetector, { Types, type DetectOptions } from '@iobroker/type-detector';
import type { LegacyConnection } from '@iobroker/adapter-react-v5';

import { getNewWidgetIdNumber, getNewWidgetId } from '@/Utils/utils';

const deviceIcons = {
    blind: <Blinds />,
    dimmer: <TipsAndUpdates />,
    door: <SensorDoor />,
    fireAlarm: <Whatshot />,
    floodAlarm: <Water />,
    humidity: <WaterDrop />,
    levelSlider: <Tune />,
    light: <Lightbulb />,
    lock: <Lock />,
    media: <PlayArrowRounded />,
    motion: <DirectionsRun />,
    rgb: <Palette />,
    rgbSingle: <Palette />,
    rgbwSingle: <Palette />,
    ct: <Palette />,
    hue: <Palette />,
    socket: <Power />,
    vacuumCleaner: <TbVacuumCleaner />,
    temperature: <Thermostat />,
    thermostat: <Thermostat />,
    volume: <VolumeUp />,
    volumeGroup: <VolumeUp />,
    weatherForecast: <WbSunny />,
    window: <WindowIcon />,
    windowTilt: <WindowIcon />,
    unknown: <QuestionMark />,
};

const allObjects = async (socket: LegacyConnection): Promise<Record<string, ioBroker.Object>> => {
    const states = await socket.getObjectViewSystem('state', '', '\u9999');
    const channels = await socket.getObjectViewSystem('channel', '', '\u9999');
    const devices = await socket.getObjectViewSystem('device', '', '\u9999');
    const folders = await socket.getObjectViewSystem('folder', '', '\u9999');
    const enums = await socket.getObjectViewSystem('enum', '', '\u9999');

    return Object.values(states)
        .concat(Object.values(channels))
        .concat(Object.values(devices))
        .concat(Object.values(folders))
        .concat(Object.values(enums))
        .reduce((obj: Record<string, ioBroker.Object>, item: ioBroker.Object) => ((obj[item._id] = item), obj), {});
};

function getObjectIcon(obj: ioBroker.Object, id: string, imagePrefix?: string): string {
    imagePrefix ||= '.'; // http://localhost:8081';
    let src = '';
    const common = obj?.common;

    if (common) {
        const cIcon = common.icon;
        if (cIcon) {
            if (!cIcon.startsWith('data:image/')) {
                if (cIcon.includes('.')) {
                    let instance;
                    if (obj.type === 'instance' || obj.type === 'adapter') {
                        if (typeof common.name === 'object') {
                            src = `${imagePrefix}/adapter/${common.name.en}/${cIcon}`;
                        } else {
                            src = `${imagePrefix}/adapter/${common.name}/${cIcon}`;
                        }
                    } else if (id?.startsWith('system.adapter.')) {
                        instance = id.split('.', 3);
                        if (cIcon[0] === '/') {
                            instance[2] += cIcon;
                        } else {
                            instance[2] += `/${cIcon}`;
                        }
                        src = `${imagePrefix}/adapter/${instance[2]}`;
                    } else {
                        instance = id.split('.', 2);
                        if (cIcon[0] === '/') {
                            instance[0] += cIcon;
                        } else {
                            instance[0] += `/${cIcon}`;
                        }
                        src = `${imagePrefix}/adapter/${instance[0]}`;
                    }
                } else {
                    return null;
                }
            } else {
                src = cIcon;
            }
        }
    }

    return src || null;
}

interface ObjectForDetector {
    _id: string;
    common: ioBroker.StateCommon | ioBroker.EnumCommon;
    name?: ioBroker.StringOrTranslated;
    type: ioBroker.ObjectType;
}

interface DetectorDevice {
    _id: string;
    common: ioBroker.StateCommon;
    type: ioBroker.ObjectType;
    deviceType: Types;
    states: ObjectForDetector[];
    name?: ioBroker.StringOrTranslated;
    roomName?: ioBroker.StringOrTranslated;
}

interface DetectorResult {
    _id: string;
    common: ioBroker.StateCommon;
    devices: DetectorDevice[];
}

const detectDevices = async (socket: LegacyConnection): Promise<DetectorResult[]> => {
    const devicesObject: Record<string, ObjectForDetector> = (await allObjects(socket)) as Record<
        string,
        ObjectForDetector
    >;
    const keys = Object.keys(devicesObject).sort();
    const detector = new ChannelDetector();

    const usedIds: string[] = [];
    const ignoreIndicators = ['UNREACH_STICKY']; // Ignore indicators by name
    const excludedTypes: Types[] = [Types.info];
    const enums: string[] = [];
    const rooms: string[] = [];
    const list: string[] = [];

    keys.forEach(id => {
        if (devicesObject[id]?.type === 'enum') {
            enums.push(id);
        } else if ((devicesObject[id]?.common as ioBroker.StateCommon)?.smartName) {
            list.push(id);
        }
    });

    enums.forEach(id => {
        if (id.startsWith('enum.rooms.')) {
            rooms.push(id);
        }
        const members = (devicesObject[id].common as ioBroker.EnumCommon).members;

        if (members?.length) {
            members.forEach((member: string) => {
                // if an object really exists
                if (devicesObject[member]) {
                    if (!list.includes(member)) {
                        list.push(member);
                    }
                }
            });
        }
    });

    const options: DetectOptions = {
        id: '',
        objects: devicesObject as Record<string, ioBroker.Object>,
        _keysOptional: keys,
        _usedIdsOptional: usedIds,
        ignoreIndicators,
        excludedTypes,
    };

    const results: DetectorResult[] = [];

    list.forEach(id => {
        options.id = id;

        const controls = detector.detect(options);

        if (controls) {
            controls.forEach(control => {
                const stateId = control.states.find(state => state.id).id;
                // if not yet added
                if (results.find(item => item.devices.find(st => st._id === stateId))) {
                    return;
                }
                const deviceObject: DetectorDevice = {
                    _id: stateId,
                    common: devicesObject[stateId].common as ioBroker.StateCommon,
                    type: devicesObject[stateId].type,
                    deviceType: control.type,
                    states: control.states
                        .filter(state => state.id)
                        .map(state => {
                            devicesObject[state.id].name = state.name;
                            devicesObject[state.id].common.role = state.defaultRole;
                            return devicesObject[state.id];
                        }),
                };

                const parts = stateId.split('.');
                let channelId: string;
                let deviceId: string;
                if (devicesObject[stateId].type === 'channel' || devicesObject[stateId].type === 'state') {
                    parts.pop();
                    channelId = parts.join('.');
                    if (
                        devicesObject[channelId] &&
                        (devicesObject[channelId].type === 'channel' || devicesObject[channelId].type === 'folder')
                    ) {
                        parts.pop();
                        deviceId = parts.join('.');
                        if (
                            !devicesObject[deviceId] ||
                            (devicesObject[deviceId].type !== 'device' && devicesObject[deviceId].type !== 'folder')
                        ) {
                            deviceId = null;
                        }
                    } else {
                        channelId = null;
                    }
                }
                // try to detect room
                const room = rooms.find(roomId => {
                    if ((devicesObject[roomId].common as ioBroker.EnumCommon).members.includes(stateId)) {
                        return true;
                    }
                    if (
                        channelId &&
                        (devicesObject[roomId].common as ioBroker.EnumCommon).members.includes(channelId)
                    ) {
                        return true;
                    }
                    return deviceId && (devicesObject[roomId].common as ioBroker.EnumCommon).members.includes(deviceId);
                });
                let roomObj: DetectorResult;
                if (room) {
                    roomObj = results.find(obj => obj._id === room);
                    if (!roomObj) {
                        roomObj = {
                            _id: room,
                            common: devicesObject[room].common as ioBroker.StateCommon,
                            devices: [],
                        };
                        results.push(roomObj);
                    }
                } else {
                    roomObj = results.find(obj => obj._id === 'unknown');
                    if (!roomObj) {
                        roomObj = {
                            _id: 'unknown',
                            common: {
                                name: 'unknown',
                                icon: '?',
                            } as ioBroker.StateCommon,
                            devices: [],
                        };
                        results.push(roomObj);
                    }
                }
                deviceObject.roomName = roomObj.common.name;
                roomObj.devices.push(deviceObject);
            });
        }
    });

    // find names and icons for devices
    for (const result of results) {
        for (const deviceObj of result.devices) {
            if (deviceObj.type === 'state' || deviceObj.type === 'channel') {
                const idArray = deviceObj._id.split('.');
                idArray.pop();

                // read channel
                const parentObject = devicesObject[idArray.join('.')];
                if (
                    parentObject &&
                    (parentObject.type === 'channel' ||
                        parentObject.type === 'device' ||
                        parentObject.type === 'folder')
                ) {
                    deviceObj.common.name = parentObject.common?.name || deviceObj.common.name;
                    if (parentObject.common.icon) {
                        deviceObj.common.icon = getObjectIcon(
                            parentObject as ioBroker.Object,
                            parentObject._id,
                            '../..',
                        );
                    }
                    idArray.pop();
                    // read a device
                    const grandParentObject = devicesObject[idArray.join('.')];
                    if (grandParentObject?.type === 'device' && grandParentObject.common?.icon) {
                        deviceObj.common.name = grandParentObject.common.name || deviceObj.common.name;
                        deviceObj.common.icon = getObjectIcon(
                            grandParentObject as ioBroker.Object,
                            grandParentObject._id,
                            '../..',
                        );
                    }
                } else {
                    deviceObj.common.name = parentObject?.common?.name || deviceObj.common.name;
                    if (parentObject?.common?.icon) {
                        deviceObj.common.icon = getObjectIcon(
                            parentObject as ioBroker.Object,
                            parentObject._id,
                            '../..',
                        );
                    }
                }
            } else {
                deviceObj.common.icon = getObjectIcon(deviceObj as any as ioBroker.Object, deviceObj._id, '../..');
            }
        }
    }

    return results;
};
const funcs = {
    deviceIcons,
    detectDevices,
    getObjectIcon,
    allObjects,
    getNewWidgetId,
    /** @deprecated use "getNewWidgetId" instead, it will give you the full wid like "w000001" */
    getNewWidgetIdNumber,
};

export default funcs;
