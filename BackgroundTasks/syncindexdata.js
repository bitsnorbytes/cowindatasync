const fs = require('fs');
const {
    google
} = require('googleapis');
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
];
const os = require("os");
const axios = require("axios");
const KEYFILEPATH = "credentials.json";
const IndexFileConfig = "indexfile.json";
const ts = Date.now();
const csvfilepath = `${os.tmpdir()}/Data${ts}.csv`;
const SheetResults = new Set();
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
const syncindexdata =async (config) => {
    const authClient = await authorize();
    const sheets = google.sheets({
        version: 'v4',
        auth: authClient
    });
    const indexfiledata = fs.readFileSync(IndexFileConfig, 'utf8');
    const indexfileParsed = JSON.parse(indexfiledata);
    const getsheetrequest = {
        spreadsheetId: indexfileParsed.spreadsheetid,
        ranges: 'Sheet1',
        includeGridData: false
      };
    
      try {
       
        const response = (await sheets.spreadsheets.get(getsheetrequest)).data;
      //   console.log(JSON.stringify(response, null, 2));
      // console.log(response.spreadsheetId);
        const deleterequest = {
          spreadsheetId: indexfileParsed.spreadsheetid,

          resource: {
              requests: [{
                      "deleteDimension": {
                          "range": {
                              "sheetId": response.sheets[0].properties.sheetId,
                              "dimension": "ROWS",
                              "startIndex": 0,
                              "endIndex": response.sheets[0].properties.gridProperties.rowCount - 1
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
      
        // const drivedatadeleterequest = {
        //     fileId: indexfileParsed.spreadsheetid
        // }         
        // try {
        //     const file = (await drive.files.delete(drivedatadeleterequest)).data;
        //     console.log(file);
        // } catch (err) {
        //     console.error(err);
        // }
        // var fileMetadata = {
        //     name: 'index',
        //     mimeType: 'application/vnd.google-apps.spreadsheet',
        //     parents: [indexfileParsed.driveid]
        //   };
       
        // const drivedatainsertrequest = {
        //     resource: fileMetadata
        // }       
         
        // try {
        //     const file = (await drive.files.create(drivedatainsertrequest)).data;
        //     indexfileParsed.spreadsheetid = file.id;
        //     fs.writeFileSync(IndexFileConfig,JSON.stringify(indexfileParsed))
        //     console.log(file.id);
        // } catch (err) {
        //     console.error(err);
        // }

        try {
            const response = await axios(config)
            const data = fs.writeFileSync(csvfilepath, response.data)
            console.log("File Saved Sucessfully")
            const readFileLines = fs.readFileSync(csvfilepath).toString('UTF8').split('\n');
            for (var line of readFileLines) {
                const insertrow = line.split(',');
                const request = {
                    spreadsheetId: indexfileParsed.spreadsheetid,
                    range: 'Sheet1!A1',
                    valueInputOption: 'RAW',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        "values": [insertrow]
                    },
                    auth: authClient,
                };
                try {
                    const response = (await sheets.spreadsheets.values.append(request)).data;
                    console.log(JSON.stringify(response, null, 2));
                    SheetResults.add(response.updates.updatedRange);
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (err) {
            console.error(err)
        }
    return SheetResults
}

module.exports = syncindexdata
