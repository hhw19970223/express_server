import { CronTask } from '../base/cron/index';
class Cron_wxPush extends CronTask {
    private _handler_list: any[]; 
    constructor() {
        super();
        this._handler_list = [];
        this._exp = '*/2 * * * * *';
    }

    public add(handler: any) {
        this._handler_list.push(handler);
    }

    public async run() {
        if (this._handler_list.length) {
            let handler = this._handler_list.shift();
            await handler();
        }
    }
}

const cron_wxPush = new Cron_wxPush();
cron_wxPush.start();

module.exports = cron_wxPush;