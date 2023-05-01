const XLSX = require('xlsx');
const fs = require('fs');
const workbook = XLSX.readFile('./table/Level1.xlsx');
workbook.SheetNames.forEach(function (sheet_name) {
    var worksheet = workbook.Sheets[sheet_name];
    var headers = {};
    var data = [];
    for (z in worksheet) {
        if (z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        };
        var col = z.substring(0, tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if (row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if (!data[row]) data[row] = {};
        if (headers[col] == "NewCardID") {
            data[row][headers[col]] = JSON.parse(value);
        } else {
            data[row][headers[col]] = value;
        }
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    let filePath = "./src/Level1/" + sheet_name + ".json";
    fs.writeFile(filePath, JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved! filePath: " + filePath);
    });
});