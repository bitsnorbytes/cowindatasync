const exportdata = require('./exportdata')
const syncindexdata = require('./syncindexdata') 

const config = {
    method: "get",
    url: "http://api.covid19india.org/csv/latest/cowin_vaccine_data_districtwise.csv"
};
async function main () {
    await syncindexdata(config);
    await exportdata();
}

// console.log(indexdataresults);
main();