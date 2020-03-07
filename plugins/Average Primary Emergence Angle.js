const group = "Plant Measurements";
const name = "Average Primary Emergence Angle";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1 
        let results = [];
        
		resolve({
            header: [
                { id: 'primEmergenceAngle', title: name}
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