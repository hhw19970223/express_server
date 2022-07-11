const cronJob = require("cron").CronJob;
import EventEmitter from "../eventEmitter/index";
export class CronTask extends EventEmitter {
    protected _exp: string;// '* * * * * *'
    private _jobid: any;
    constructor() {
        super();
        this._exp = '0 * * * * *';
    }

    public start() {
        let self = this;
        self.jobid = new cronJob(self._exp, function () {
            self.run();
        }, null, false, 'Asia/Chongqing');


        self.jobid.start();
    }

    public stop() {
        if (this._jobid) {
            this._jobid.stop();
        }
    }

    public async run() {

    }
}
