export const parseIntStrict = (a:string) => {
    var n = parseInt(a);
    if (isNaN(n)) throw "Error";
    return n
}