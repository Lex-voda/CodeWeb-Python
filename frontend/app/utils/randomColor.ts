export const randomColor = (size: number, opacity?: number) => {
  let randomcolor: Array<string> = [];
  for (let i = 0; i < size; i++) {
    let temp1 = Math.floor(Math.random() * 28 + 228);
    let temp2 = Math.floor(Math.random() * 28 + 228);
    let temp3 = Math.floor(Math.random() * 28 + 228);
    if (opacity) {
      let tempColor = `rgba(${temp1},${temp2},${temp3},${opacity})`;
      if (randomcolor.indexOf(tempColor) != -1) {
        continue;
      }
      randomcolor.push(`rgba(${temp1},${temp2},${temp3},${opacity})`);
    } else {
      let tempColor = `rgb(${temp1},${temp2},${temp3})`;
      if (randomcolor.indexOf(tempColor) != -1) {
        continue;
      }
      randomcolor.push(`rgb(${temp1},${temp2},${temp3})`);
    }
  }
  return randomcolor;
};
