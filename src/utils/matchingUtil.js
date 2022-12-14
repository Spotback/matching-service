import * as Constants from '../utils/constants';

/**
 * Takes in x,y -> "x,(y+1)"
 * @param {number} x - coordinate
 * @param {number} y - coordinate
 */
function xSameYUpper(x, y) {
    let newY;
    if (y <= 0) {
        newY = (Math.abs(y) + 0.01) * -1;
    } else {
        newY = y + 0.01;
    }
    let blocCoord = x.toFixed(2) + "," + newY.toFixed(2);
    return blocCoord;
}

/**
 * Takes in x,y -> "x,(y-1)"
 * @param {number} x - coordinate
 * @param {number} y - coordinate
 */
function xSameYLower(x, y) {
    let newY;
    if (y <= 0) {
        newY = (Math.abs(y) - 0.01) * -1;
    } else {
        newY = y - 0.01;
    }
    let blocCoord = x.toFixed(2) + "," + newY.toFixed(2);
    return blocCoord;
}

/**
 * Takes in x,y -> "(x+1),y"
 * @param {number} x - coordinate
 * @param {number} y - coordinate
 */
function ySameXUpper(x, y) {
    let newX;
    if (x <= 0) {
        newX = (Math.abs(x) + 0.01) * -1;
    } else {
        newX = x + 0.01;
    }
    let blocCoord = newX.toFixed(2) + "," + y.toFixed(2);
    return blocCoord;
}

/**
 * Takes in x,y -> "(x-1),y"
 * @param {number} x - coordinate
 * @param {number} y - coordinate
 */
function ySameXLower(x, y) {
    let newX;
    if (x <= 0) {
        newX = (Math.abs(x) - 0.01) * -1;
    } else {
        newX = x - 0.01;
    }
    let blocCoord = newX.toFixed(2) + "," + y.toFixed(2);
    return blocCoord;
}

/**
 * Takes in coordinates and generates a query
 * that will search for blocks near the coordinates
 * @param {string} desiredLocation
 * @returns {Object} mongodb query
 */
export const generateLookupQuerey = (desiredLocation) => {
    const longitudeX = parseFloat(desiredLocation.split(",")[0]);
    const latitudeY = parseFloat(desiredLocation.split(",")[1]);
    const xSameYUp = xSameYUpper(longitudeX, latitudeY);
    const xSameYSame = longitudeX.toFixed(2) + "," + latitudeY.toFixed(2);
    const xSameYLow = xSameYLower(longitudeX, latitudeY);
    const xUpYSame = ySameXUpper(longitudeX, latitudeY);
    const xlowYSame = ySameXLower(longitudeX, latitudeY);
    let query = {
        blockCoordinate: {
            $in: [xSameYUp, xSameYSame, xSameYLow, xUpYSame, xlowYSame]
        }
    };
    return query;
}

/**
 * Takes in spots-by-block, merges spots into new array
 * and returns it. Efficiency info can be found here:
 * https://jsperf.com/multi-array-concat/7
 * @param {Object[]} blocks
 * @returns {Object[]} array of spots
 */
export const mergeAvailSpots = (blocks) => {
    let block1Spots = blocks[0] && blocks[0].spots ? blocks[0].spots : [];
    let block2Spots = blocks[1] && blocks[1].spots ? blocks[1].spots : [];
    let block3Spots = blocks[2] && blocks[2].spots ? blocks[2].spots : [];
    let block4Spots = blocks[3] && blocks[3].spots ? blocks[3].spots : [];
    let block5Spots = blocks[4] && blocks[4].spots ? blocks[4].spots : [];
    return [].concat.apply([], [block1Spots, block2Spots, block3Spots, block4Spots, block5Spots]);
}

/**
 * Used to prevent matches with large cars to small cars.
 * @param {Object} clientCar
 * @param {Object} potentialSpot
 * @returns {boolean} are the cars compatible for a match
 */
export const filterCarType = (clientCar, potentialSpot) => {
    let filter = clientCar.carType + '|' + potentialSpot.car.carType;
    if (filter === 'LARGE|SMALL') return false;
    if (filter === 'SMALL|LARGE') return false;
    return true;
}

/**
 * Used to prevent matches with unavailable spots.
 * @param {Object} cachedSpots - map of cached spots {someemail@gmail.com: 1} email will be key and value will always be 1
 * @param {Object} potentialSpot - potential spot containing spot info
 * @returns {boolean} have we already recommended this spot
 */
export const filterCached = (cachedSpots, potentialSpot) => {
    if (potentialSpot.email in cachedSpots) return false;
    return true;
}

/**
 * Used to convert redis scan to a useable map.
 * @param {Object[]} redisScan - result of a redis scan - Java Object
 * @returns {Object} a map of all the keys in the redis scan
 */
export const javaArrayToMap = (redisScan) => {
    try {
        //map will contain all the unavailable spots from the last 5 mins
        let map = {};
        return map;
        let size = redisScan[1].length;
        for (let i = 0; i < size; i++) {
            let list = redisScan[1];
            let key = list[1];
            //set email as key, and value can be anything, wont be using the value
            map[key] = 1;
        }
        return map;
    } catch (err) {
        console.log(Constants.REDIS_SCAN_CONVERT_ERR + err);
        return {};
    }
}

/**
 * This will calculate and set the grade of each spot and return the best grade index for filteredSpots
 * @param {Object[]} desiredETAInfo - eta info for spots to users desired location.
 * @param {Object[]} currentETAInfo - eta info for spots to users current location.
 * @param {Object[]} filteredSpots - spots to grade (grade = -Math.abs(desired.dis.val + desired.dur.val + current.dis.val + current.dur.val))
 * @returns {number} represents the index in fileteredSpots containing the best grade
 */
export const gradeSpots = (desiredETAInfo, currentETAInfo, filteredSpots) => {
    try {

        //will keep track of where the highest score is in the array
        let bestGradeIndex = 0;
        let bestGrade = 0;
        //empty array means no spots to grade return -1
        if (filteredSpots.length < 1 || desiredETAInfo.length < 1 || currentETAInfo.length < 1) return -1;
        //calculate grade for both objects in same go and keep track of the index and best grade
        let grade = 0;
        for (let i = 0; i < desiredETAInfo.length; i++) {
            console.log("grade",filteredSpots[i].leaveTime, currentETAInfo[i].distance.value)
            console.log("grade",filteredSpots[i].leaveTime - currentETAInfo[i].distance.value)

            // need to check if spot is more than 5mins away from location and if distance to client is more than the leave time
            if (Math.abs(filteredSpots[i].leaveTime - currentETAInfo[i].distance.value) > 300
                || desiredETAInfo[i].distance.value > 300) {
                grade = -111111111111111;
            } else {
                //assign abs(grade based on distance and duration) the higher the better
                grade = -Math.abs(desiredETAInfo[i].distance.value + desiredETAInfo[i].duration.value + currentETAInfo[i].distance.value + currentETAInfo[i].duration.value);
            }
            filteredSpots[i].grade = grade;
            filteredSpots[i].etaFromSpot = desiredETAInfo[i].duration;
            filteredSpots[i].etaFromClient = currentETAInfo[i].duration;
            if (grade >= bestGrade) {
                bestGrade = grade;
                bestGradeIndex = i;
            }
        }
        if (grade === -111111111111111) return -1;
        return bestGradeIndex;
    } catch (err) {
        console.log(Constants.GRADE_SPOTS_ERR + err);
        return -1;
    }
}

/**
 * Used to generate a uri for google to get ETA from spot to location.
 * @param {Object[]} filteredSpots - containing coordinates field
 * @param {string} location - coordinates of the location "12.34556,-121.34342"
 * @param {string} mode - transportation method to location, ie: walking, driving, bus
 * @returns {string[]} Google DistanceMatrix Destinations param
 */
export const generateDestinationUri = (filteredSpots, location, mode) => {
    //100 because there can be 100 locations in each param uri
    const paramCount = Math.ceil(filteredSpots.length / 100);
    //create array to hold the partitioned uris
    let paramUris = Array(paramCount);

    /**
     * Generates an array of destination params.
     * @param {Object[]} obj - containing coordinates field
     * @param {number} nextIndex starts at 0, should be incremented at end of recurse function
     * @param {number} stopPointEvery100
     * @param {number} paramLinkIndex - which url to add the coords to in the array of multiple urls
     */
    function recurse(obj, nextIndex, stopPointEvery100, paramLinkIndex) {
        try {
            //create empty param
            let param = '';
            if (obj.length > 0 && nextIndex < obj.length) {
                //if array has items then add the first part of param/ and the next index is less than the length
                param += '&destinations=';
                //loop thru the items incrementing the nextIndex
                for (let i = nextIndex; i < obj.length && i < stopPointEvery100; i++) {
                    //if item is the last one dont add a pipe to end
                    if (i === stopPointEvery100 - 1 || i === obj.length - 1) {
                        param += obj[i].coordinates;
                    } else {
                        //concat coordinates to the param
                        param += obj[i].coordinates + '|';
                    }
                    //keep up to date
                    nextIndex = i;
                }
                //add destination params to the right index
                paramUris[paramLinkIndex++] = '/maps/api/distancematrix/json?units=imperial&origins=' + location + param + '&key=' + Constants.GOOGLE_API_KEY + `&mode=${mode}`;
                //keep recursing until all uris are generated, increment nextIndex, increase stop point by 100 every time
                recurse(filteredSpots, ++nextIndex, stopPointEvery100 + 100, paramLinkIndex);
            }
        } catch (err) {
            console.log(Constants.PARTITION_URI_ERR + err);
            paramUris = [];
            return;
        }
    }

    //generate the link recursively
    recurse(filteredSpots, 0, 100, 0);
    //return the generated uris[]
    return paramUris;
}
