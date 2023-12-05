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
    Window,
    Palette,
    PlayArrowRounded,
    Power,
    TipsAndUpdates,
    Tune,
    WaterDrop,
} from '@mui/icons-material';

import { TbVacuumCleaner } from 'react-icons/tb';
import ChannelDetector from '@iobroker/type-detector';
import { getNewWidgetIdNumber, getNewWidgetId } from '../Utils/utils';

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
    window: <Window />,
    windowTilt: <Window />,
};

const allObjects = async socket => {
    const states = await socket.getObjectView('', '\u9999', 'state');
    const channels = await socket.getObjectView('', '\u9999', 'channel');
    const devices = await socket.getObjectView('', '\u9999', 'device');
    const folders = await socket.getObjectView('', '\u9999', 'folder');
    const enums = await socket.getObjectView('', '\u9999', 'enum');

    return Object.values(states)
        .concat(Object.values(channels))
        .concat(Object.values(devices))
        .concat(Object.values(folders))
        .concat(Object.values(enums))
        // eslint-disable-next-line
        .reduce((obj, item) => (obj[item._id] = item, obj), {});
};

function getObjectIcon(obj, id, imagePrefix) {
    imagePrefix = imagePrefix || '.'; // http://localhost:8081';
    let src = '';
    const common = obj && obj.common;

    if (common) {
        const cIcon = common.icon;
        if (cIcon) {
            if (!cIcon.startsWith('data:image/')) {
                if (cIcon.includes('.')) {
                    let instance;
                    if (obj.type === 'instance' || obj.type === 'adapter') {
                        src = `${imagePrefix}/adapter/${common.name}/${cIcon}`;
                    } else if (id && id.startsWith('system.adapter.')) {
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

const detectDevices = async socket => {
    const devicesObject = await allObjects(socket);
    const keys = Object.keys(devicesObject).sort();
    const detector = new ChannelDetector();

    const usedIds = [];
    const ignoreIndicators = ['UNREACH_STICKY'];    // Ignore indicators by name
    const excludedTypes = ['info'];
    const enums = [];
    const rooms = [];
    const list = [];

    keys.forEach(id => {
        if (devicesObject[id]?.type === 'enum') {
            enums.push(id);
        } else if (devicesObject[id]?.common?.smartName) {
            list.push(id);
        }
    });

    enums.forEach(id => {
        if (id.startsWith('enum.rooms.')) {
            rooms.push(id);
        }
        const members = devicesObject[id].common.members;

        if (members && members.length) {
            members.forEach(member => {
                // if an object really exists
                if (devicesObject[member]) {
                    if (!list.includes(member)) {
                        list.push(member);
                    }
                }
            });
        }
    });

    const options = {
        objects: devicesObject,
        _keysOptional: keys,
        _usedIdsOptional: usedIds,
        ignoreIndicators,
        excludedTypes,
    };

    const result = [];

    list.forEach(id => {
        options.id = id;

        const controls = detector.detect(options);

        if (controls) {
            controls.forEach(control => {
                const stateId = control.states.find(state => state.id).id;
                // if not yet added
                if (result.find(item => item.devices.find(st => st._id === stateId))) {
                    return;
                }
                const deviceObject = {
                    _id: stateId,
                    common: devicesObject[stateId].common,
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
                let channelId;
                let deviceId;
                if (devicesObject[stateId].type === 'channel' || devicesObject[stateId].type === 'state') {
                    parts.pop();
                    channelId = parts.join('.');
                    if (devicesObject[channelId] && (devicesObject[channelId].type === 'channel' || devicesObject[channelId].type === 'folder')) {
                        parts.pop();
                        deviceId = parts.join('.');
                        if (!devicesObject[deviceId] || (devicesObject[deviceId].type !== 'device' && devicesObject[deviceId].type !== 'folder')) {
                            deviceId = null;
                        }
                    } else {
                        channelId = null;
                    }
                }
                // try to detect room
                const room = rooms.find(roomId => {
                    if (devicesObject[roomId].common.members.includes(stateId)) {
                        return true;
                    }
                    if (channelId && devicesObject[roomId].common.members.includes(channelId)) {
                        return true;
                    }
                    return deviceId && devicesObject[roomId].common.members.includes(deviceId);
                });
                let roomObj;
                if (room) {
                    roomObj = result.find(obj => obj._id === room);
                    if (!roomObj) {
                        roomObj = {
                            _id: room,
                            common: devicesObject[room].common,
                            devices: [],
                        };
                        result.push(roomObj);
                    }
                } else {
                    roomObj = result.find(obj => obj._id === 'unknown');
                    if (!roomObj) {
                        roomObj = {
                            _id: 'unknown',
                            common: {
                                name: 'unknown',
                                icon: '?',
                            },
                            devices: [],
                        };
                        result.push(roomObj);
                    }
                }
                deviceObject.roomName = roomObj.common.name;
                roomObj.devices.push(deviceObject);
            });
        }
    });

    // find names and icons for devices
    for (const k in result) {
        for (const k2 in result[k].devices) {
            const deviceObj = result[k].devices[k2];
            if (deviceObj.type === 'state' || deviceObj.type === 'channel') {
                const idArray = deviceObj._id.split('.');
                idArray.pop();

                // read channel
                const parentObject = devicesObject[idArray.join('.')];
                if (parentObject && (parentObject.type === 'channel' || parentObject.type === 'device' || parentObject.type === 'folder')) {
                    deviceObj.common.name = parentObject.common?.name || deviceObj.common.name;
                    if (parentObject.common.icon) {
                        deviceObj.common.icon = getObjectIcon(parentObject, parentObject._id, '../..');
                    }
                    idArray.pop();
                    // read device
                    const grandParentObject = devicesObject[idArray.join('.')];
                    if (grandParentObject?.type === 'device' && grandParentObject.common?.icon) {
                        deviceObj.common.name = grandParentObject.common.name || deviceObj.common.name;
                        deviceObj.common.icon = getObjectIcon(grandParentObject, grandParentObject._id, '../..');
                    }
                } else {
                    deviceObj.common.name = parentObject?.common?.name || deviceObj.common.name;
                    if (parentObject?.common?.icon) {
                        deviceObj.common.icon = getObjectIcon(parentObject, parentObject._id, '../..');
                    }
                }
            } else {
                deviceObj.common.icon = getObjectIcon(deviceObj, deviceObj._id, '../..');
            }
        }
    }

    return result;
};

export default {
    deviceIcons,
    detectDevices,
    getObjectIcon,
    allObjects,
    getNewWidgetId,
    /** @deprecated use "getNewWidgetInfo" instead, it will give you the full wid like "w000001" */
    getNewWidgetIdNumber,
};
