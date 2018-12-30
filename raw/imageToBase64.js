/*
 * This convert frames extract from video to base64
 * 
 * Step to extract frame:
 * $ brew install ffmpeg
 * $ ffmpeg -i video.mp4 -vf fps=10 -qscale:v 2 filename_%04d.jpg
 */

const Path = require('path');
const fs = require("fs");

const totalFrames = 99;
const filePrefix = 'fireworks_';

const encode = (file) => {
  const img = fs.readFileSync(file);
  return new Buffer(img).toString("base64");
};

console.log("export default [");
for (let i = 1; i <= totalFrames; i++) {
 const data = encode(Path.resolve(__dirname, './' + filePrefix + ("000" + i).slice(-4) + '.jpg'));
 console.log("  'data:image/jpg;base64," + data + "',");
}

console.log("];");