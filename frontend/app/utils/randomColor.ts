export const randomColor = (
  size: number,
  config?: { start?: number; end?: number; opacity?: number }
) => {
  if (config === undefined) {
    config = { start: 0, end: 255, opacity: 1 };
  }
  if (config.start === undefined) {
    config.start = 0;
  }
  if (config.end === undefined) {
    config.end = 255;
  }
  if (config.opacity === undefined) {
    config.opacity = 1;
  }
  let randomcolor: Array<string> = [];
  for (let i = 0; i < size; i++) {
    let temp1 = Math.floor(
      Math.random() * (config.end - config.start) + config.start
    );
    let temp2 = Math.floor(
      Math.random() * (config.end - config.start) + config.start
    );
    let temp3 = Math.floor(
      Math.random() * (config.end - config.start) + config.start
    );
    let tempColor = `rgba(${temp1},${temp2},${temp3},${config.opacity})`;
    if (randomcolor.indexOf(tempColor) != -1) {
      i--;
      continue;
    }
    randomcolor.push(`rgba(${temp1},${temp2},${temp3},${config.opacity})`);
  }
  return randomcolor;
};
