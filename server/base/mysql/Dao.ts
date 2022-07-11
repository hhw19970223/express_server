const mysql = require("mysql");
const config = require('./config');//数据库配置;
import { changeDaoName } from "../common/UTIL";
import STR from '../tool/string/index';
class Dao {
    private _dbName: string;
    private _client: any;
    public daoName: string;

    set client(v: any) {
        this._client = mysql.createConnection(v);
    }

    get client(): any {
        return this._client;
    }

    set dbName(v: string) {
        this._dbName = v;
    }

    get dbName(): string {
        return this._dbName;
    }

    constructor(dbName: string) {
        this._dbName = dbName;
        this.daoName = changeDaoName(dbName);
    }

    public async query(sql: string): Promise<any> {
        let self = this;
        return new Promise((resolve, reject) => {
            if (!self.client) {
                reject("client为空");
            }
            self.client.query(sql, function (err: any, rows: any[], fields: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }

    public async list(cnd: any, postfix?: string, col?: string): Promise<any> {
        let self = this;
        col = col ? col : "*";
        let sql = "select " + col + " from " + self.dbName + " where 1=1";
        if (typeof cnd == "object") {
            for (let key in cnd) {
                sql += " and " + key + " = '" + cnd[key] + "'";
            }
        }
        else if (typeof cnd == "string") {
            sql += cnd;
        }
        else {
            throw "条件类型错误";
        }

        if (postfix) {
            sql += ` ${postfix}`;
        }

        let rows: any[] = await self.query(sql);
        return rows || [];
    }

    public async select(cnd: any, col?: string): Promise<any> {
        let self = this;
        let list: any[] = await self.list(cnd, 'limit 0,1', col);
        return list[0];
    }

    public async create(data: any): Promise<any> {
        let self = this;
        let sql = `INSERT INTO ${self.dbName}`;
        if (typeof data == "object") {
            let keyStr: string = "";
            let valueStr: string = "";
            for (let key in data) {
                if (!keyStr) {
                    keyStr =  key;
                } else {
                    keyStr += "," + key;
                }

                if (!valueStr) {
                    valueStr = "'" + data[key] + "'";
                } else {
                    valueStr += ",'" + data[key] + "'";
                }
            }
            sql += ` (${keyStr}) VALUES (${valueStr})`;
        }
        else {
            throw("数据有误!");
        }
        await self.query(sql);
        return;
    }

    public async update(data: any, cnd: any): Promise<any> {
        let self = this;
        let sql = `update ${self.dbName}`;
        if (typeof data == "object") {
            let dataStr: string = "";
            for (let key in data) {
                if (!dataStr) {
                    dataStr = ` set ${key} = '${data[key]}'`;
                } else {
                    dataStr += ` , ${key} = '${data[key]}'`;
                }
            }

            sql += ` ${dataStr} where 1=1`;
        }
        else {
            throw("数据有误!");
        }

        if (typeof cnd == "object") {
            for (let key in cnd) {
                sql += " and " + key + "='" + cnd[key] +"'";
            }
        }
        else if (typeof cnd == "string") {
            sql += cnd;
        }

        await self.query(sql);
        return;
    }

    public async del(cnd: any): Promise<any> {
        let self = this;
      
        let sql = "delete from " + self.dbName + " where 1=1";
        if (typeof cnd == "object") {
            for (let key in cnd) {
                sql += " and " + key + " = " + cnd[key];
            }
        }
        else if (typeof cnd == "string") {
            sql += cnd;
        }
        else {
            throw ("条件有误!");
        }

        await self.query(sql);
        return;
       
    }

    public async end(cb?: (err?: any, rst?: any) => void): Promise<any> {
        let self = this;
        return new Promise((resolve, reject) => {
            if (!self.client) {
                throw "client为空";
            }
            self.client.end(function (err?: any) {
                if (err) {
                    reject(err);
                } else {
                    resolve(0);
                }

            });
        })
    }

}

let daoCollection: any = {};//存放数据库集合配置
let appNameConfig = config.appNameConfig;


export function getDbName(appName: any, team: string, sid: number = 1): any {
    let dbName = appNameConfig[appName] || "dq-hhw";
    return dbName.replace("team", team).replace("index", STR.fill(sid.toString(), "0000"))
}

export function getDao(tableName: string, dbName: string = "dq-hhw", noAuto?: boolean): any {
    let DaoName = changeDaoName(tableName);
    if (!daoCollection[dbName]) daoCollection[dbName] = {};
    if (daoCollection[dbName][DaoName]) {
        return daoCollection[dbName][DaoName];
    } else {
        let dao = new Dao(tableName);
        let dbConfig = noAuto ? config[dbName] : config["auto"];
        dbConfig.database = dbName;
        dao.client = dbConfig;
        daoCollection[dbName][DaoName] = dao;
        return dao;
    }
}





