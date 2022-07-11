/**
* 企业微信推送 通过text格式
* @param {string} msg
* @param {string} key
* @param {string[]} phoneList 推送指定用户的电话号码
* @param {Boolean} isAll
*/
export function pushWx_text(msg: string, key: string, phoneList: string[], isAll?: Boolean) {
    if (!key) return;
    let postData: any = {
        "msgtype": "text",
        "text": {
            "content": msg,
        }
    }

    if (isAll) {
        if (!phoneList) phoneList = [];
        phoneList.push("@all");
    }

    if (phoneList && phoneList.length) {
        postData.text.mentioned_mobile_list = phoneList;
    }
    _pushWx(postData, key);
}

/**
 * 企业微信推送 通过markdown格式
 * @param {string} msg
 * @param {string} key
 * @param {string} name
 */
export function pushWx_markdown(msg: string, key: string, name?: string) {
    if (!key) return;
    if (name) msg += `\n<@${name}>`;
    let postData: any = {
        "msgtype": "markdown",
        "markdown": {
            "content": msg,
        }
    }

    _pushWx(postData, key);
}


function _pushWx(postData: any, key: string) {
    let data = JSON.stringify(postData);
    let options: any = {
        hostname: "qyapi.weixin.qq.com",
        port: "443",
        path: "/cgi-bin/webhook/send?key=" + key,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }

    }

    let https = require("https");
    if (https) {
        let rst = https.request(options, function (res: any) {

        })
        rst.write(data);
        rst.end();
    }
}
    