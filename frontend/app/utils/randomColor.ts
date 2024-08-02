
export const randomColor = (size: number) => {
    let randomcolor = [];
    for (let i = 0; i < size; i++) {
        let temp1 = Math.floor(Math.random() * 28 + 228);
        let temp2 = Math.floor(Math.random() * 28 + 228);
        let temp3 = Math.floor(Math.random() * 28 + 228);
        randomcolor.push(`rgb(${temp1},${temp2},${temp3})`);
    }
    return randomcolor;
}
