import { readFile } from '../file/index'
import { ColInfo } from '../xml/index'

export interface BinlogInfo {
    table: string,
    database: string,
    actType: string,
    where?: any,
    set?: any,
    doTime: string,
    doTimeInt: number 
}

const actTypeList: string[] = ["Update_rows", "Write_rows"];
const actTypeMap: any = {
    "Update_rows": "update",
    "Write_rows": "insert"
}

export function getBinlogList(path: string): string[][] {
    let strList: string[][] = [];
    let content: string;
    try {
        content = readFile(path);
    } catch (e) {
        return [];
    }
    strList = eachTextLine(content, actTypeList, "# at");
    return strList;
}


export function analyzeBinlog(xmlMap: any, binlogList: string[]): any {
    let map: any = {
        table: '',  
        binlogInfoList: []
    };
    
    let binlogInfo: BinlogInfo = <any>{};
    
    //### INSERT INTO`00处理数据使用`.`c_melee_log`
    let list = binlogList[1].match(/\`.*?\`/g);// [`00处理数据使用`, `c_melee_log`]
    if (list && list.length) {
        binlogInfo.database = list[0].substring(1, list[0].length - 1);
        binlogInfo.table = list[1].substring(1, list[1].length - 1);
    }

    if (!binlogInfo.table) {
        return map;
    } else if (!xmlMap[binlogInfo.table]) {
        return map;
    }

    map.table = binlogInfo.table;

    for (let actType of actTypeList) {
        if (binlogList[0].indexOf(actType) > -1) {
            binlogInfo.actType = actTypeMap[actType];
            break;
        }
    }

    //binlogList[0] 时间相关的信息 
    //#210915 15:44:38 server id 1  end_log_pos 1571 CRC32 0x36b4658c
    let time = binlogList[0].substr(1, 15);//210915 15:44:38
    binlogInfo.doTime = "20" + time.substring(0, 2) + '/' + time.substring(2, 4) + '/'
        + time.substring(4);
    binlogInfo.doTimeInt = new Date(binlogInfo.doTime).getTime();

    let colInfoList: ColInfo[] = xmlMap[binlogInfo.table];
    let setIdx = -1;
    let where: any = binlogInfo.where = {};
    let set: any = binlogInfo.set = {};
    for (let i = 2; i < binlogList.length; i++) {
        let text = binlogList[i];
        
        if(text === binlogList[1]) {
            map.binlogInfoList.push(JSON.parse(JSON.stringify(binlogInfo)));
            setIdx = -1;
            where = binlogInfo.where = {};
            set = binlogInfo.set = {};
        }

        let idx = text.indexOf('@');//@在字符串的位置
        if (setIdx == -1 && text.indexOf('SET') > -1) {//### SET
            setIdx = i;
        } else if (idx > -1) {
            //###   @1=2
            text = text.substring(idx + 1);//1=2
            let textList: string[] = text.split('=');//['1', '2']
            let colInfo: ColInfo = colInfoList[parseInt(textList[0]) - 1];
            let key: string;
            let data = textList[1]
            if (colInfo) {
                key = colInfo.title + '(' + colInfo.name + ')'
            } else {
                key = "@" + textList[0]
            }
            if (setIdx > -1) {//set
                set[key] = data;
            } else {//where
                where[key] = data;
            }
        }
    }
    map.binlogInfoList.push(JSON.parse(JSON.stringify(binlogInfo)));
    return map
} 

//包含lineStartList 不包含 lineEndList   写死不通用
function eachTextLine(content: string, lineStartList: string[], lineEnd: string): string[][] {
    let strList: string[][] = [];
    let idxB: number = -1;
    let idxE: number = -1;
    let contentList = content.split('\n');
    for (let i = 0; i < contentList.length; i++) {
        if (contentList[i]) {
            contentList[i] = contentList[i].replace(/\r/g, '');
        }
        let text = contentList[i];
        if (idxB == -1) {
            for (let j = 0; j < lineStartList.length; j++) {
                if (text.indexOf(lineStartList[j]) > -1) {
                    idxB = i;
                    break;
                }
            }
        } else {
            if (text.indexOf(lineEnd) > -1) {
                idxE = i;
                let textList = contentList.slice(idxB, idxE);
                strList.push(textList);
                idxB = -1;
                idxE = -1;
            }
        }
    }
    return strList;
}

