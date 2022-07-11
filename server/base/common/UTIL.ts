

/** 判断是否存在特殊字符 */
export function isSpecialWord(value: string): boolean {
    let patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im;
    if (!patrn.test(value)) {// 如果包含特殊字符返回false
        return false;
    }
    return true;
}

export function changeDaoName(tableName: string): string {
    let daoName = '';
    let flag = false; //下个字母是否需要大写
    for (let i = 0; i < tableName.length; i++) {
        let word = tableName[i];
        if (isSpecialWord(word)) {
            flag = true;
            continue;
        }
        if (flag) {
            word = word.toUpperCase();
        }
        daoName += word;
        flag = false;
    }
    daoName += "Dao";
    return daoName;
}
