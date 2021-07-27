const fs = require("fs");
const {
    google,
} = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const KEYFILEPATH = "credentials.json";
const DISTRICTSHEETPATH = "districtlist.json";
const data = fs.readFileSync(DISTRICTSHEETPATH, 'utf8')
const parseddata = JSON.parse(data);

const authClient = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});
const sheets = google.sheets({
    version: 'v4',
    auth: authClient
});
main();
async function main() {
    for (let district of parseddata) {
        const request = {
            spreadsheetId: district.spreadsheetid,
            resource: {
                requests: [{
                    "addSheet": {
                        "properties": {
                            "title": district.District,
                        }
                    }
                }],
            },
        };
        try {
            const response = (await sheets.spreadsheets.batchUpdate(request)).data;
            console.log(JSON.stringify(response, null, 2));
        } catch (err) {
            console.error(err);
        }
    }
}
