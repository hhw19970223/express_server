// import { writeFile, readFile, isExists } from "../base/tool/file";
import { analyzeXml, TableInfo, splicing } from "../base/tool/xml";
import tool from "../base/tool/tool/index";
import { analyzeBinlog, getBinlogList, BinlogInfo} from "../base/tool/binlog"

let binlog = {
    xmlMap: <any>{},
    binlogMap: <any>{},
    xmlPath: './file/db.xml',
    binlogPath: './file/binlog.log',
    analyzeXml(req: any, agrs: any, cb?: any) {
        analyzeXml(this.xmlPath, (content: string, nodeXml: any) => {
            if (nodeXml) {
                let tableList: any = nodeXml.ds ? nodeXml.ds.table : null;
                if (tableList && tableList.length) {
                    tableList.forEach((table: any) => {
                        if (table['$'] && table['$'].name) {
                            let tableName = table['$'].name;
                            let tableLineInfo = tool.getTextLine(content, `<table name="${tableName}"`
                                , '</table>', true);
                            if (tableLineInfo) {
                                let tableStrList = tool.removeSpaceWithList(tableLineInfo.contentList);
                                let tableInfo: TableInfo = splicing(table, tableStrList);
                                this.xmlMap[tableInfo.tableName] = tableInfo.colInfoList;
                            } else {
                                console.error("表" + tableName + "的xml编写不规范");
                            }   
                        }    
                    });
                }
            }
            if (cb) return cb();
        });
    }, 
    analyzeBinlog(req: any, agrs: any, cb?: any) {
        let strList: string[][] = getBinlogList(this.binlogPath);
        let map: { [tabelName: string]: BinlogInfo[]} = {};
        for (let i = 0; i < strList.length; i++) {
            let obj: any = analyzeBinlog(this.xmlMap, strList[i]);
            if (obj.table && obj.binlogInfoList.length) {
                if (!map[obj.table]) {
                    map[obj.table] = [];
                }
                map[obj.table].push(...obj.binlogInfoList);
            }
        }
        this.binlogMap = map;
        if (cb) return cb();
    },    

    getTableList(req: any, agrs: any, cb: any) {
        let list = [];
        for (let key in this.xmlMap) {
            list.push(key)
        }
        cb(list);
    },
    getDataList(req: any, agrs: any, cb: any) {
        let list: BinlogInfo[] = [];
        if (!agrs.tableName) throw "请选择查询的表";
        if (!this.binlogMap[agrs.tableName]) return cb(list);
        for (let i = 0; i < this.binlogMap[agrs.tableName].length; i++) {
            let binlogInfo: BinlogInfo = this.binlogMap[agrs.tableName][i];
            if (agrs.database && agrs.database != binlogInfo.database) continue;
            if (agrs.dateList) {
                if (agrs.dateList[0]) {
                    let beginDateInt = new Date(agrs.dateList[0]).getTime();
                    if (binlogInfo.doTimeInt < beginDateInt) continue;
                } 
                if (agrs.dateList[1]) {
                    let endDateInt = new Date(agrs.dateList[1]).getTime();
                    if (binlogInfo.doTimeInt > endDateInt) break;
                }
            }
            list.push(binlogInfo);
        }
        cb(list);
    },
}
binlog.analyzeXml(null, null, null);
binlog.analyzeBinlog(null, null, null);
module.exports = binlog;