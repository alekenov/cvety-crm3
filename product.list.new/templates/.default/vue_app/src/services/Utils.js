const toRawType = require('core-js/internals/classof-raw');

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isObject (obj) {
    return toRawType(obj) === 'Object';
}

function isArray(arr) {
    return toRawType(arr) === 'Array';
}

function isNumber(numb) {
    return toRawType(numb) === 'Number';
}

function isString(str) {
    return toRawType(str) === 'String';
}

function getFileSrc(file) {
    const fileReader = new FileReader();

    const promise = new Promise((resolve) => {
        fileReader.onload = function (result) {
            resolve(result.target.result);

            return result.target.result;
        }
    });

    fileReader.readAsDataURL(file);

    return promise;
}

const simpleClone = value => JSON.parse(JSON.stringify(value));

const getSectionName = function (id, sectionsMap) {
    const names = [];

    do {
        let section = sectionsMap[id];

        names.push(section.name);

        id = section.parentId;
    } while (id);

    return names.join('/');
};

const getUserAgentStr = function () {
    if ("undefined" == typeof navigator || "undefined" == typeof window) {
        return null;
    }

    const e = navigator.userAgent || navigator.vendor || window.opera;

    return /windows phone/i.test(e) ? "windows" : /android/i.test(e) ? "android" : !/iPad|iPhone|iPod/.test(e) || window.MSStream ? null : "ios";
};

const isIos = function () {
    return getUserAgentStr() === 'ios';
};

const pos = window.BX.pos;

export {
    isObject,
    isArray,
    isNumber,
    isString,
    getFileSrc,
    pos,
    simpleClone,
    getSectionName,
    isIos,
};