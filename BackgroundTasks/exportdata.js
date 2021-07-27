const fs = require('fs');
const {
    google
} = require('googleapis');
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const DistrictListSheet = "districtlist.json";
const KEYFILEPATH = "credentials.json";
const IndexFileConfig = "indexfile.json";

async function authorize() {
    let authClient = null;
    authClient = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    });
    if (authClient == null) {
        throw Error('authentication failed');
    }

    return authClient;
}
const exportdata = async () => {
    const authClient = await authorize();
    const sheets = google.sheets({
        version: 'v4',
        auth: authClient
    });
    const indexdata = fs.readFileSync(IndexFileConfig, 'utf8')
    const parsedindexdata = JSON.parse(indexdata);
    const data = fs.readFileSync(DistrictListSheet, 'utf8')
    const parseddata = JSON.parse(data);
    const updatesSet = new Set();
    const request = {
        spreadsheetId: parsedindexdata.spreadsheetid,
        range: 'Sheet1'
    };
    try {
        const response = (await sheets.spreadsheets.values.get(request)).data;
        //console.log(JSON.stringify(response, null, 2));
        let districtdataStartingIndex = 0
        let districtcounter = 0;
        let firstrow = [];
        let secondrow = []
        for (var districtdata of response.values) {

            if (districtdataStartingIndex === 0) {
                firstrow = districtdata;
            } else if (districtdataStartingIndex === 1) {

                secondrow = districtdata;
            } else {
                const getsheetrequest = {
                  spreadsheetId: parseddata[districtcounter].spreadsheetid,
                  ranges: [parseddata[districtcounter].District],
                  includeGridData: false
                };
              
                try {
                  const response = (await sheets.spreadsheets.get(getsheetrequest)).data;
                //   console.log(JSON.stringify(response, null, 2));
                // console.log(response.spreadsheetId);
                  const deleterequest = {
                    spreadsheetId: parseddata[districtcounter].spreadsheetid,

                    resource: {
                        requests: [{
                                "deleteDimension": {
                                    "range": {
                                        "sheetId": response.sheets[0].properties.sheetId,
                                        "dimension": "ROWS",
                                        "startIndex": 0,
                                        "endIndex": response.sheets[0].properties.gridProperties.rowCount - 3
                                    }
                                }
                            }

                        ],
                    },

                };

                try {
                    const response = (await sheets.spreadsheets.batchUpdate(deleterequest)).data;
                    // console.log(JSON.stringify(response, null, 2));
                } catch (err) {
                    console.error(err);
                }
                } catch (err) {
                  console.error(err);
                }
                

                
                const districtdataValues = [
                    firstrow,
                    secondrow,
                    districtdata
                ]
                const request = {
                    spreadsheetId: parseddata[districtcounter].spreadsheetid,
                    resource: {
                        valueInputOption: 'RAW',
                        data: [{
                            "range": parseddata[districtcounter].District,
                            "majorDimension": "ROWS",
                            "values": districtdataValues
                        }],
                    },

                };

                try {
                    const response = (await sheets.spreadsheets.values.batchUpdate(request)).data;
                    console.log(JSON.stringify(response, null, 2));
                    updatesSet.add(response.responses[0].updatedRange);
                } catch (err) {
                    console.error(err);
                }
                districtcounter++;
            }

            districtdataStartingIndex++;
        }
        
    } catch (err) {
        console.error(err);
    }
    return updatesSet
}
module.exports = exportdata