module.exports = {
    lineDistance: points => {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++)
        {
            let p1 = points[i];
            let p2 = points[i+1];
            distance += Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
        }
        return distance;
    },
    getPlantID: line => line.id.match(/([0-9]+)/)[1],
    getPlantPrimaryID: line => line.id.match(/([0-9]+)-([0-9]+)/),
    getAllIDs: line => line.id.match(/([0-9]+)-([0-9]+).?([0-9]+)?/),
    addToAverage: (total, newVal, frame) => (total + newVal) / frame
}