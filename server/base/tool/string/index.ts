export default {
    fill(src: string, fillStr: string) {
        let len = (src += "").length;
        let fillLen = fillStr.length;
        return len >= fillLen ? src : fillStr.substring(0, fillLen - len) + src;  
    }
}