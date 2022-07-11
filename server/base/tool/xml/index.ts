let xml2js = require('xml2js')
let parser = new xml2js.Parser({ explicitArray: true});
import { readFile } from '../file/index'
import tool from '../tool/index'

export interface TableInfo {
    tableName: string
    colInfoList: ColInfo[]
}

export interface ColInfo {
    title: string
    name: string
    type: string
}

export function analyzeXml(path: string, cb: any) {
    let content: string;
    try {
        content = readFile(path);
    } catch (e) {
        return cb();//文件不存在
    }
    
    parser.parseString(content, function (errors: any, rst: any) {
        if (errors) {
            console.error(errors)
            cb();
        } else {
            cb(content, rst);
        }
    })
      
}

/** 拼接 */
export function splicing(table: any, tableStrList: string[]): TableInfo{
    let ignoreList = ["$", "comment"];
    let tableInfo: TableInfo = {
        tableName: table['$'].name,
        colInfoList: []
    };

    for (let key in table) {
        if (ignoreList.indexOf(key) == -1 && table[key]) {
            table[key].forEach((item: any) => {
                if (item['$'] && item['$'].name) {
                    let colInfo: ColInfo = {
                        title: item['_'] || item['$'].name,
                        name: item['$'].name,
                        type: key
                    }

                    for (let i = 1; i < tableStrList.length; i++) {
                        let idx = tableStrList[i].indexOf(`name="${colInfo.name}"`);
                        if (idx > -1) {
                            tableInfo.colInfoList[i] = colInfo;
                            break;
                        }
                    }
                }  
            });
        }
    }
    tableInfo.colInfoList = tableInfo.colInfoList.filter((item) => {
        return !!item
    })
    return tableInfo;
}

