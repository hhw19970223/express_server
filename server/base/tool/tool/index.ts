interface LineInfo {
    textList: string[];
    startIdx: number;//初始的第几行
    endIdx: number;//结束的第几行
    contentList: string[]; //截取文本内容
    content: string;//截取文本内容
}
export default {
    //根据换行截取文本
    getTextLineInfo(content: string, lineStart: string, lineEnd: string): LineInfo {
        let textList: string[] = content.split('\n');
        let startIdx: number = -1;
        let endIdx: number  = -1;
        for (let i = 0; i < textList.length; i++) {
            let text = textList[i];
            if (!text) continue;
            if (startIdx < 0) {
                if (text.indexOf(lineStart) > 0) {
                    startIdx = i;
                }
            } else {
                if (text.indexOf(lineEnd) > 0) {
                    endIdx = i;
                    break;
                }
            }
        }
        return <LineInfo>{
            startIdx: startIdx,
            endIdx: endIdx,
            textList: textList
        }
    },

    isChoice(lineInfo: LineInfo, contain?: boolean): Boolean {
        if (lineInfo.startIdx === -1 || lineInfo.endIdx === -1) return false;
        return contain ? !!(lineInfo.startIdx <= lineInfo.endIdx) : !!(lineInfo.startIdx + 1 <= lineInfo.endIdx - 1)
    },

    //美化代码
    removeSpaceWithList(textList: string[]): string[] {
        if (textList && textList.length) {
            for (let i = textList.length - 1; i >= 0; i--) {
                if (!textList[i].trim()) {
                    textList.splice(i, 1);
                }
            }
        }
        return textList;
    },

    //美化代码
    removeSpace(content: string): string {
        let textList = content.split('\n');
        this.removeSpaceWithList(textList);
        return textList.join('\n');
    },

    //根据换行截取文本进行删除后返回
    removeTextLine(content: string, lineStart: string, lineEnd: string, contain?: boolean) {
        let lineInfo: LineInfo = this.getTextLineInfo(content, lineStart, lineEnd);
        if (this.isChoice(lineInfo, contain)) {
            let textList: string[];
            if (contain) {
                lineInfo.textList.splice(lineInfo.startIdx, lineInfo.endIdx - lineInfo.startIdx + 1);
            } else {
                lineInfo.textList.splice(lineInfo.startIdx + 1, lineInfo.endIdx - lineInfo.startIdx - 1);
            }
            return lineInfo.textList.join('\n');
        } else {
            return content;
        }
    },

    //获取截取的部分
    getTextLine(content: string, lineStart: string, lineEnd: string, contain?: boolean): LineInfo{
        let lineInfo: LineInfo = this.getTextLineInfo(content, lineStart, lineEnd);
        if (this.isChoice(lineInfo, contain)) {
            let textList: string[];
            if (contain) {
                textList = lineInfo.textList.splice(lineInfo.startIdx, lineInfo.endIdx - lineInfo.startIdx + 1);
            } else {
                textList = lineInfo.textList.splice(lineInfo.startIdx + 1, lineInfo.endIdx - lineInfo.startIdx - 1);
            }
            lineInfo.contentList = textList;
            lineInfo.content = textList.join('\n');
        } else {
            lineInfo.content = "";
        }
        return lineInfo;
    },

    //匹配到文本上一行加入文本
    addTextLine(content: string, matchStr: string, addText: string): string{
        let textList = content.split('\n');
        let idx = -1;
        if (textList && textList.length) {
            for (let i = textList.length - 1; i >= 0; i--) {
                if (textList[i].indexOf(matchStr) > -1) {
                    idx = i;
                    break;
                }
            }
        }
        if (idx > -1) {
            textList.splice(idx, 0, addText);
        }
        return textList.join('\n');
    },
}