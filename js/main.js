const fieldInit = (field, fieldOpt, maxAlt, minAlt, time) => {
  const leftOffset = 50, // ширина текста
        fieldWidth = 1200, // ширина поля
        timeScale = 50, // секунд в делении
        pixelPerScaleT = Math.round(fieldWidth / (timeScale + time)), // количество пикселей на 1 секунду
        bottomOffset = 50, // высота текста
        fieldHeight = 600, // высота поля
        heightScale = 10, // метров в делении
        pixelPerScaleH = Math.floor(fieldHeight / (heightScale + maxAlt)) > 0 ? Math.floor(fieldHeight / (heightScale + maxAlt)) : 1, // количество пикселей на 1 метр
        fontSize = 10

  maxAlt = (maxAlt - maxAlt%heightScale) + heightScale; // Добавления запаса выше максимальной высоты.
  minAlt = (minAlt - minAlt%heightScale) - heightScale; // Добавления запаса ниже минимального значения.
  time = (time - time%timeScale) + timeScale; // Добавления запаса на шкале времени.

  const width = time * pixelPerScaleT + leftOffset;
  const height = maxAlt * pixelPerScaleH + bottomOffset + (-minAlt) * pixelPerScaleH;

  if (field.width === width && field.height === height) return;

  field.width = width;
  field.height = height;

  const ctx = field.getContext("2d");

  // save orientation again
  ctx.save();
  // hold top-right hand corner when rotating
  ctx.translate( width - 1, height/2 );
  // rotate 270 degrees
  ctx.rotate( 3 * Math.PI / 2 );
  ctx.font = `${fontSize}pt Arial`;
  ctx.fillStyle = "#0000ff"; // blue
  ctx.textAlign = "center";
  // draw relative to translate point
  ctx.fillText( "Высота (метры)", 0, -width+fontSize+2 );
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#00F";
  ctx.font = `${fontSize}pt Arial`;
  ctx.fillText("Время (секунды)", width/2, height -5);

  ctx.beginPath();
  ctx.moveTo(0, 0);


  ctx.fillStyle = "#ddd";
  ctx.strokeStyle = "#000";
  ctx.fillRect(leftOffset - 1, 0, width - leftOffset, height - bottomOffset);
  ctx.strokeRect(leftOffset - 1, 1, width - leftOffset, height - bottomOffset);

  const heightZero = (height - bottomOffset) - ((-minAlt)*pixelPerScaleH);

  for (let i = heightScale*pixelPerScaleH; i <= height - bottomOffset; i += heightScale * pixelPerScaleH) {
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = "#c5c5c5";
    ctx.moveTo(leftOffset, i);
    ctx.lineTo(width - 2, i);
    ctx.stroke();

    ctx.fillStyle = "#00F";
    ctx.font = `italic ${fontSize}pt Arial`;
    ctx.fillText(heightZero/pixelPerScaleH -  (i/pixelPerScaleH), fontSize*3, fontSize/2 + i);
  }

  for (let i = 0; i < width-leftOffset; i += timeScale * pixelPerScaleT) {
    ctx.moveTo(i + leftOffset, height - bottomOffset);
    ctx.lineTo(i + leftOffset, 0);
    ctx.stroke();

    ctx.textAlign = "center"
    ctx.fillStyle = "#00F";
    ctx.font = `italic ${fontSize}pt Arial`;
    ctx.fillText(i/pixelPerScaleT, i + leftOffset, height-fontSize*3);
  }

  fieldOpt.heightZero = heightZero;
  fieldOpt.leftOffset = leftOffset;
  fieldOpt.pixelPerScaleH = pixelPerScaleH;
  fieldOpt.pixelPerScaleT = pixelPerScaleT;
  fieldOpt.bottomOffset = bottomOffset;
  fieldOpt.heightScale = heightScale;
  fieldOpt.leftOffset = leftOffset;
  fieldOpt.maxAlt = maxAlt;
  fieldOpt.width = width;
  fieldOpt.height = height;
  fieldOpt.change = true;
}

const graph = (wrap, fileList, name, log, options, color, callback) => {
  const fileIcons = document.querySelectorAll('.file__item');
  const fields = document.querySelectorAll('.log__log');
  let fieldIcon = {}, field = {};
  let elementFinded = false;
  for (let i = 0; i < fileIcons.length; i++) {
    if (fileIcons[i].innerText === name) {
      elementFinded = true;
      fieldIcon = fileIcons[i];
      for (let j = 0; j < fields.length; j++) {
        if (fields[j].dataset.name === name) {
          field = fields[j];
          continue;
        }
      }
      continue;
    }
  }
  if (!elementFinded) {
    fieldIcon = document.createElement("li");
    fieldIcon.className = "file__item";
    fieldIcon.innerText = name;
    fieldIcon.addEventListener('click', (e) => {
      callback(e.target);
    });
    fileList.appendChild(fieldIcon);

    field = document.createElement("canvas");
    field.className = "log__log";
    field.setAttribute('data-name', name);
    wrap.appendChild(field);
  }

  fieldIcon.style = `color: ${color}`;
  field.width = options.width;
  field.height = options.height;
  const ctx = field.getContext("2d");

  ctx.clearRect(0, 0, field.width, field.height);

  ctx.strokeStyle = color;
  ctx.setLineDash([0, 0]);
  ctx.beginPath();
  ctx.moveTo(opt.leftOffset, opt.heightZero);
  ctx.stroke();

  for (var i = 1; i < log.length; i++) {
    if (log[i].e > 1104) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([0, 0]);
      ctx.beginPath();
      ctx.moveTo(opt.leftOffset + log[i-1].s * opt.pixelPerScaleT, opt.heightZero - (log[i-1].a) * opt.pixelPerScaleH);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([0, 0]);
      ctx.beginPath();
      ctx.moveTo(opt.leftOffset + log[i-1].s * opt.pixelPerScaleT, opt.heightZero - (log[i-1].a) * opt.pixelPerScaleH);
    }
    ctx.lineTo(opt.leftOffset + log[i].s * opt.pixelPerScaleT, opt.heightZero - (log[i].a) * opt.pixelPerScaleH);
    ctx.stroke();
  }
}

const graphRemove = (name) => {

}

const graphChangeActive = (active) => {
  const fields = document.querySelectorAll('.log__log');
  const buttons = document.querySelectorAll('.file__item');
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].dataset.name === active.innerText) {
      fields[i].classList.add('log__log_active');
    } else {
      fields[i].classList.remove('log__log_active');
    }
  }
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerText === active.innerText) {
      buttons[i].classList.add('file__item_active');
    } else {
      buttons[i].classList.remove('file__item_active');
    }
  }

}


const canvas = document.getElementById("field");
const log = document.querySelector('.log');
const logButton = document.querySelector('.file__list');
let currentColor = 0;

const data = [];
const opt = {};

fieldInit(canvas, opt, 200, 0, 600);

const input = document.getElementById('inputFile');
const logButtonClick = (element) => {
  graphChangeActive(element);
}

const colors = [
  "#6A5ACD",
  "#009B76",
  "#C1876B",
  "#44944A",
  "#003153",
  "#FF2400",
  "#CED23A",
  "#B00000",
  "#BD33A4",
  "#425E17"
]

const graphRender = (logCanvas, logWrap, logButton, fieldOpt, data) => {
  let maxAlt = 0, minAlt = 0, seconds = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].data.length; j++) {
      if (maxAlt < data[i].data[j].a) maxAlt = data[i].data[j].a;
      if (minAlt > data[i].data[j].a) minAlt = data[i].data[j].a;
      if (seconds < data[i].data[j].s) seconds = data[i].data[j].s;
    }
  }
  fieldInit(logCanvas, fieldOpt, maxAlt, minAlt, seconds);
  for (let i = 0; i < data.length; i++) {
    if (!data[i].rendered || fieldOpt.change) {
      console.log(fieldOpt.change);
      graph(logWrap, logButton, data[i].name, data[i].data, fieldOpt, data[i].color, logButtonClick);
      data[i].rendered = true;
    }
  }
  fieldOpt.change = false;
}

input.addEventListener('change', (evt) => {
  let fileLength = evt.currentTarget.files.length;
  if (fileLength) {
    for (let i = 0; i < fileLength; i++) {
      const fileName = evt.currentTarget.files[i].name;
      const reader = new FileReader();
      reader.onload = function(event) {
        let contents = event.target.result;
        data.push({"name": fileName, "data":JSON.parse(contents), "color": colors[currentColor], "rendered": false});
        if (currentColor++ > colors.length) currentColor = 0;
        graphRender(canvas, log, logButton, opt, data);
      };
      reader.readAsText(evt.currentTarget.files[i]);
    }
  }
})

canvas.addEventListener('mousemove', (e) => {
  const alt = opt.maxAlt - (e.layerY / opt.pixelPerScaleH - opt.heightScale + 1);
  const time = (e.layerX - opt.leftOffset) / opt.pixelPerScaleT;
  //console.log(time, alt);
})
