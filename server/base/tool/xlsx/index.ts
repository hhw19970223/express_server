let xlsx = require('node-xlsx');
import { readFile } from '../file/index'
// const fs = require('fs');


export default {
    sheetList: <any>{},
    getSheetList(name: string): any[] {
        if (!this.sheetList[name]) {
            let list: any[] = [];
            // let sheets = xlsx.parse(fs.readFileSync(name));
            let sheets = xlsx.parse(readFile(name))
            sheets.forEach(function (sheet: any) {
                let obj: any = {};
                let keys = [];
                // 遍历xlsx每行内容
                for (let rowId in sheet['data']) {
                    let row = sheet['data'][rowId];
                    if (parseInt(rowId) == 0) {
                        keys = row;
                    } else {
                        for (let i = 0; i < row.length; i++) {
                            obj[keys[i]] = row[i];
                        }
                    }
                }
            });
            this.sheetList[name] = list
        }
        return this.sheetList[name];
    }
}
