export const makeMinSecString = (second: number):string => {
    const min = Math.floor(second / 60);
    const sec = second - min * 60;

    return `${min}:${String(sec).padStart(2, '0')}`
}