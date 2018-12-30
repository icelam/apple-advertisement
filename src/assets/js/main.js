/* 
 * Import
 */
import FileSaver from 'file-saver';
import GIFEncoder from 'gif.js.optimized';
import images from '@js/images';

/* 
 * Variables
 */
const canvasWidth = 320;
const canvasHeight = 180;

/* 
 * Functions
 */
const drawText = (ctx,str,clearCanvas) => {
  if(clearCanvas) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }
  ctx.scale(1, 0.8);
  ctx.font = '25px 微軟正黑體,"Microsoft JhengHei","Microsoft JhengHei UI","Heiti TC","PingFang TC","Lantinghei TC","Apple LiGothic","PMingLiU",Arial,sans-serif';
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffff60';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowColor = 'black';
  ctx.fillText(str.trim(), canvasWidth/2, canvasHeight*1.25/2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

const renderGIF = (str) => {
  // create off screen canvas
  const offScreenCanvas = document.createElement('canvas');
  offScreenCanvas.width = canvasWidth;
  offScreenCanvas.height = canvasHeight;
  const offScreenContext = offScreenCanvas.getContext('2d');

  //render options
  let renenderIndex = 0;
  const renderRate = parseInt(document.getElementById('renderRate').value);
  //const renenderQuality = parseInt(document.getElementById('renderQuality').value);
  const timestamp = new Date().getTime();

  //loading mask
  const elem_loading_mask = document.getElementById('loadingMask');
  const elem_render_progress = document.getElementById('renderProgress');
  elem_loading_mask.style.display="block";

  //GIF encode
  const gifEncoder = new GIFEncoder({
    workers: 4,
    quality: 10,
    dither: false,
    repeat: 0,
    width: canvasWidth,
    height: canvasHeight,
    debug: false
  });

  gifEncoder.on('finished', function(blob) {
    elem_loading_mask.style.display = 'none';
    elem_render_progress.innerHTML =  "0%";
    FileSaver.saveAs(blob, 'fireworks-' + timestamp + '.gif');
  });

  gifEncoder.on('progress', function(p) {
    elem_render_progress.innerHTML =  (Math.round(p * 100)) + "%";
  });

  //add frames
  const loadFrameSequence = () => {
    if (renenderIndex < images.length) {
      let img = new Image();
      img.onload = () => {
        offScreenContext.clearRect(0, 0, canvasWidth, canvasHeight);
        offScreenContext.drawImage(img, 0, 0);
        drawText(offScreenContext, str, false);
        gifEncoder.addFrame(offScreenContext, {copy: true, delay: (100 * renderRate)});
        //Load next frame
        renenderIndex += renderRate;
        loadFrameSequence();
      };

      img.src = images[renenderIndex];
    } else {
      gifEncoder.render();
    }
  };

  loadFrameSequence();
};

/*
 * Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  //canvas
  const canvas = document.getElementById('preview__text');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');

  //elements
  const elem_gif_text = document.getElementById('gifText');
  const elem_render_btn = document.getElementById('renderButton');

  //Add listener to text field to update canvas
  ['change', 'blur', 'keyup'].forEach(function(event) {
    elem_gif_text.addEventListener(event, () => {
      drawText(context, elem_gif_text.value, true);
    });
  });

  //Add listener to button
  elem_render_btn.addEventListener('click', () => {
    if (/CriOS/i.test(navigator.userAgent) && /iphone|ipod|ipad/i.test(navigator.userAgent)) { //iOS Chrome not support blob download
      document.getElementById('not-supported').style.display = 'block';
    } else {
      renderGIF(elem_gif_text.value);
    }
  });

  //init
  drawText(context, elem_gif_text.value, true);
});