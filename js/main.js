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

  fieldOpt.change = false;
  if (field.width === width && field.height === height) return;

  const fieldNav = document.getElementById('fieldNav');
  const fieldNavRange = document.getElementById('fieldNavRange');

  fieldNav.width = width;
  fieldNav.height = height;
  fieldNavRange.width = width;
  fieldNavRange.height = height;

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
//log color
const graph = (wrap, fileList, data, options, callback, dataToRemoveOnClose) => {
  const fileIcons = document.querySelectorAll('.file__item');
  const fields = document.querySelectorAll('.log__log');
  let engineMax = 0, engineOff = 0;
  let fieldIcon = {}, field = {};
  let elementFinded = false;
  for (let i = 0; i < fileIcons.length; i++) {
    if (fileIcons[i].dataset.name === data.name) {
      elementFinded = true;
      fieldIcon = fileIcons[i];
      for (let j = 0; j < fields.length; j++) {
        if (fields[j].dataset.name === data.name) {
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
    fieldIcon.setAttribute('data-name', data.name);
    fieldIcon.setAttribute('data-color', data.color);
    fieldIcon.innerText = data.name[0].toUpperCase() + data.name.slice(1, data.name.length - 5);
    fieldIcon.addEventListener('click', (e) => {
      callback(e.target);
    });
    const fieldClose = document.createElement("div");
    fieldClose.className = "file__item-close";
    fieldClose.addEventListener('click', (e) => {
      const rmName = e.target.parentElement.dataset.name;
      const rmIcon = document.querySelectorAll(".file__item");
      const rmLog = document.querySelectorAll(".log__log");
      const rmLogRange = document.querySelector('.log__range');
      if (rmLogRange) {
        const ctxRange = rmLogRange.getContext('2d');
        ctxRange.clearRect(0, 0, rmLogRange.width, rmLogRange.height);
      }
      for (let i = 0; i < rmIcon.length; i++) {
        if (rmIcon[i].dataset.name === rmName) {
          rmIcon[i].classList.add('file__item_remove');
          setTimeout(()=>{
            rmIcon[i].remove();
          },400)
        }
        if (rmLog[i].dataset.name === rmName) {
          rmLog[i].style.opacity = 0;
          setTimeout(()=>{
            rmLog[i].remove();
          },400)
        }
      }
      if (!dataToRemoveOnClose) return;
      for (var i = 0; i < dataToRemoveOnClose.length; i++) {
        if (dataToRemoveOnClose[i].name === rmName) {
          dataToRemoveOnClose.splice(i,1);
          continue;
        }
      }
    })
    fieldIcon.appendChild(fieldClose);
    fileList.appendChild(fieldIcon);

    field = document.createElement("canvas");
    field.className = "log__log";
    field.setAttribute('data-name', data.name);
    wrap.appendChild(field);
  }

  fieldIcon.style = `color: ${data.color}`;
  field.width = options.width;
  field.height = options.height;
  const ctx = field.getContext("2d");

  ctx.clearRect(0, 0, field.width, field.height);

  ctx.strokeStyle = data.color;
  ctx.setLineDash([0, 0]);
  ctx.beginPath();
  ctx.moveTo(opt.leftOffset, opt.heightZero);
  ctx.stroke();

  engineMax = data.data[0].e;
  engineOff = data.data[0].e;
  for (let i = 0; i < data.data.length; i++) {
    if (engineMax < data.data[i].e) engineMax = data.data[i].e;
    if (engineOff > data.data[i].e) engineOff = data.data[i].e;
  }
  data.engineMax = engineMax;
  data.engineOff = engineOff;
  const engineOffset = ((data.engineMax - data.engineOff) / 100) * 4 + data.engineOff;
  console.log(data);

  for (let i = 1; i < data.data.length; i++) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 1;
    if (data.data[i].e > engineOffset) ctx.lineWidth = 4;
    ctx.setLineDash([0, 0]);
    ctx.beginPath();
    ctx.moveTo(opt.leftOffset + data.data[i-1].s * opt.pixelPerScaleT, opt.heightZero - (data.data[i-1].a) * opt.pixelPerScaleH);
    ctx.lineTo(opt.leftOffset + data.data[i].s * opt.pixelPerScaleT, opt.heightZero - (data.data[i].a) * opt.pixelPerScaleH);
    ctx.stroke();
  }

  if (document.querySelectorAll('.file__item').length > 0)
    callback(document.querySelectorAll('.file__item')[0]);
}

const graphChangeActive = (active, data) => {
  const fields = document.querySelectorAll('.log__log');
  const buttons = document.querySelectorAll('.file__item');
  let activeItem;
  for (let i = 0; i < buttons.length; i++) {
    if (data[i] && data[i].name === active.dataset.name) {
      data[i].active = true;
      activeItem = i;
    } else if (data[i]){
      data[i].active = false;
    }
    if (buttons[i].dataset.name === active.dataset.name) {
      buttons[i].classList.add('file__item_active');
      buttons[i].style = `color: #fff; background-color: ${buttons[i].dataset.color};`;
    } else {
      buttons[i].classList.remove('file__item_active');
      buttons[i].style = `background-color: #fff; color: ${buttons[i].dataset.color};`;
    }
    if (fields[i].dataset.name === active.dataset.name) {
      fields[i].classList.add('log__log_active');
    } else {
      fields[i].classList.remove('log__log_active');
    }
  }
  return activeItem;
}

const navigateLog = (fieldNav, time, data, fieldOpt) => {
  const ctx = fieldNav.getContext('2d');
  time -= 1;
  const minut = Math.floor(data.data[time] ? data.data[time].s / 60 : time / 60),
      second = (data.data[time] ? data.data[time].s: time) - (60 * (minut));
  if (!data.data[time]) return;
  const legendAlt = document.querySelector('.log__altitude');
  const legendEng = document.querySelector('.log__engine');
  const legendTime = document.querySelector('.log__time');
  const legendTemp = document.querySelector('.log__temp');
  legendAlt.innerText =  `Высота: ${data.data[time].a} м`;
  legendEng.innerText =  `Двигателя: ${data.data[time].e}`;
  legendTime.innerText = `Время: ${minut < 10 ? '0'+minut : minut}:${second < 10 ? '0'+second : second}`;
  legendTemp.innerText = `Температура: ${data.data[time].t}\u2103`;
  const fieldX = (time) * fieldOpt.pixelPerScaleT + fieldOpt.leftOffset;
  const fieldY = fieldOpt.heightZero - data.data[time].a * fieldOpt.pixelPerScaleH;
  ctx.beginPath();
  ctx.clearRect(0, 0, fieldNav.width, fieldNav.height);
  ctx.moveTo(fieldX, 1);
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineTo(fieldX, fieldNav.height - fieldOpt.bottomOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.arc(fieldX, fieldY, 4, 0, Math.PI*2, true);
  ctx.stroke();
}

const canvas = document.getElementById("field");
const log = document.querySelector('.log');
const logButton = document.querySelector('.file__list');
const fieldNav = document.getElementById("fieldNav");
const fieldNavRange = document.getElementById("fieldNavRange");
let currentColor = 0;

const data = [];
const opt = {};
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
let activeItem = null;
const mouseButton = {
  press: false,
  start: 0,
  end: 0,
  rangeSelected: false
};
const input = document.getElementById('inputFile');

fieldInit(canvas, opt, 200, 0, 600);

const logButtonClick = (element) => {
  activeItem = graphChangeActive(element, data);
}


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
      graph(logWrap, logButton, data[i], fieldOpt, logButtonClick, data);
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
        data.push({"name": fileName,
                    "data":JSON.parse(contents),
                    "color": colors[currentColor],
                    "rendered": false,
                    "active": false,
                    "engineOff": 0,
                    "engineMax": 0});
        if (currentColor++ > colors.length) currentColor = 0;
        graphRender(canvas, log, logButton, opt, data);
        evt.target.value = '';
      };
      reader.readAsText(evt.currentTarget.files[i]);
    }
  }
})

const navigateLogRange = (fieldNavRange, timeStart, timeEnd, rangeSelected, data, fieldOpt) => {
  const rangeTime = document.querySelector('.log__range-time');
  const rateOfClimb = document.querySelector('.log__range-rtc');
  const ctx = fieldNavRange.getContext('2d');

  if (!rangeSelected) {
    ctx.clearRect(0, 0, fieldNavRange.width, fieldNavRange.height);
    return;
  }

  const rangeStart = timeStart < timeEnd ? timeStart : timeEnd,
  rangeEnd   = timeStart < timeEnd ? timeEnd : timeStart;
  const start = rangeStart * fieldOpt.pixelPerScaleT + fieldOpt.leftOffset;
  const end = rangeEnd * fieldOpt.pixelPerScaleT + fieldOpt.leftOffset;

  ctx.clearRect(0, 0, fieldNavRange.width, fieldNavRange.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
  ctx.fillRect(fieldOpt.leftOffset, 0, start - fieldOpt.leftOffset, fieldNavRange.height - fieldOpt.bottomOffset);
  ctx.fillRect(end, 0, fieldOpt.width, fieldNavRange.height - fieldOpt.bottomOffset);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(start, 0, end - start, fieldNavRange.height - fieldOpt.bottomOffset);

  const time = rangeEnd - rangeStart; // Вывод длительности выделеного участка
  const minut = Math.floor(time / 60),
      second = ( time) - (60 * (minut));
  rangeTime.innerText = `Выделено: ${minut < 10 ? '0'+minut: minut}:${second < 10 ? '0'+second : second}`;

  if (!data.data[rangeStart] || !data.data[rangeEnd]) return;

  let rtc = 0, engTime = 0; // Подсчет скороподъемности.
  rtc = (data.data[rangeEnd].a - data.data[rangeStart].a) / time;
  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (data.data[i].e > 1105) engTime++;
  }

  rateOfClimb.innerText = `Скороподъемность: ${rtc.toFixed(2)} м/с`;
}

fieldNav.addEventListener('mousemove', (e) => {
  const time = Math.round((e.layerX - opt.leftOffset) / opt.pixelPerScaleT);

  if (!data[activeItem]) return;
  navigateLog(fieldNav, time, data[activeItem], opt);

  if (mouseButton.press) {
    mouseButton.end = time - 1;
    navigateLogRange(fieldNavRange, mouseButton.start, mouseButton.end, mouseButton.rangeSelected, data[activeItem], opt);
  }
})

fieldNav.addEventListener('mousedown', (e) => {
  const time = Math.round((e.layerX - opt.leftOffset) / opt.pixelPerScaleT);
  mouseButton.press = true;
  mouseButton.start = time - 1;
  mouseButton.end = time - 1;
})
fieldNav.addEventListener('mouseup', (e) => {
  const time = Math.round((e.layerX - opt.leftOffset) / opt.pixelPerScaleT);
  mouseButton.press = false;
  mouseButton.end = time - 1;
  if (mouseButton.start === mouseButton.end) {
    mouseButton.rangeSelected = false;
    navigateLogRange(fieldNavRange, 0, 0, data[activeItem], opt);
  } else {
    mouseButton.rangeSelected = true;
  }
})
