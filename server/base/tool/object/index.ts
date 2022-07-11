export default {
    isEmpty(obj: any) {
        return obj ? 0 == Object.keys(obj).length : null == obj;
    }
}