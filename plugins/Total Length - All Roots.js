const group = "Plant Measurements";
const name = "Total Length - All Roots";
const id = 'plantTotalLengthAll';
const description = "Cumulative length of all roots per plant";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson);;
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });

        polylines.forEach(line => {
            let distance = utils.lineDistance(line.points);

            if (!multiplePlants) results[0][id] += distance;

            else
            {
                let plantID = utils.getPlantID(line);
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object[id] += distance : results.push({ tag: `${tag}:${plantID}`, [id]: distance });
            }
        });

		resolve({
            header: [
                { id, title: name }
            ],
            results, 
            group 
        });
	});
};

module.exports = {
    name,
    group,
    description,
    function: plugin
};