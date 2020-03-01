
const group = "Plant Measurements";
const name = "Lateral Root Count";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = rsmlJson.rsml[0].metadata[0]['file-key'][0]["$t"]; 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1;
        let results = [];
        if (!multiplePlants) results.push({ tag, laterals: 0 });

        polylines.forEach(line => {
            if (!multiplePlants && line.type == 'lateral') return results[0].laterals++;

            if (line.type == 'lateral') 
            {
                let plantID = line.id.match(/([0-9]+)/)[1];
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object.laterals++ : results.push({ tag: `${tag}:${plantID}`, laterals: 1 });
            }
        });

		resolve({
            header: [
                { id: 'laterals', title: name}
            ],
            results, 
            group 
        });
	});
};

module.exports = {
    name,
    group,
    function: plugin
};