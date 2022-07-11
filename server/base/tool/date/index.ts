export default {
    addMinutes(date: Date, x: number) {
        date.setMinutes(date.getMinutes() + x);
    },
    addHours(date: Date, x: number) {
        date.setHours(date.getDate() + x);
    },
    addDate(date: Date, x: number) {
        date.setDate(date.getDate() + x);
    },
    addMonth(date: Date, x: number) {
        date.setMonth(date.getMonth() + x);
    },
}