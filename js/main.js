const fieldInit = (field, maxAlt, time) => {
  const leftOffset = 50, // ширина текста
        bottomOffset = 50, // высота текста
        heightScale = 10, // метров в делении
        timeScale = 50, // секунд в делении
        pixelPerScale = 2, // количество пикселей на 1 метр
        fontSize = 10;
  maxAlt+= heightScale  * pixelPerScale; // чтобы нарисовать отметки -10 и 0

  field.width = time * pixelPerScale + leftOffset + timeScale*pixelPerScale;
  field.height = maxAlt * pixelPerScale + bottomOffset;

  const width = field.width,
        height = field.height;
  const ctx = field.getContext("2d");

  // save orientation again
  ctx.save();
  // hold top-right hand corner when rotating
  ctx.translate( width - 1, height/2 );
  // rotate 270 degrees
  ctx.rotate( 3 * Math.PI / 2 );
  ctx.font = "10pt Arial";
  ctx.fillStyle = "#0000ff"; // blue
  ctx.textAlign = "center";
  // draw relative to translate point
  ctx.fillText( "Высота (метры)", 0, -width+fontSize+2 );
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#00F";
  ctx.font = "10pt Arial";
  ctx.fillText("Время (секунды)", width/2, height -5);

  ctx.beginPath();
  ctx.moveTo(0, 0);


  ctx.fillStyle = "#ddd";
  ctx.strokeStyle = "#000";
  ctx.fillRect(leftOffset - 1, 0, width - leftOffset, height - bottomOffset);
  ctx.strokeRect(leftOffset - 1, 1, width - leftOffset, height - bottomOffset)


  for (let i = height - bottomOffset; i >= heightScale*pixelPerScale; i-= heightScale * pixelPerScale) {
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = "#c5c5c5";
    ctx.moveTo(leftOffset, i);
    ctx.lineTo(width - 2, i);
    ctx.stroke();

    ctx.fillStyle = "#00F";
    ctx.font = "italic 10pt Arial";
    ctx.fillText((maxAlt - heightScale)-(i/pixelPerScale), fontSize*3, fontSize/2 + i);
  }

  for (let i = 0; i < width-leftOffset; i += timeScale * pixelPerScale) {
    ctx.moveTo(i + leftOffset, height - bottomOffset);
    ctx.lineTo(i + leftOffset, 0);
    ctx.stroke();

    ctx.textAlign = "center"
    ctx.fillStyle = "#00F";
    ctx.font = "italic 10pt Arial";
    ctx.fillText(i/pixelPerScale, i + leftOffset, height-fontSize*3);
  }

  return { // возвращаем объект с настройками
    "heightZero": height - bottomOffset - heightScale * pixelPerScale,
    "leftOffset": leftOffset,
    "pixelPerScale": pixelPerScale,
    "width": width,
    "height": height
  }
}

const graph = (wrap, fileList, name, log, options, color) => {
  const fileIcon = document.createElement("li");
  fileIcon.className = "file__item";
  fileIcon.style = `color: ${color}`;
  fileIcon.innerText = name;
  fileList.appendChild(fileIcon);

  const field = document.createElement("canvas");
  field.className = "log__log";
  field.width = options.width;
  field.height = options.height;
  wrap.appendChild(field);
  const ctx = field.getContext("2d");

  ctx.strokeStyle = color;
  ctx.setLineDash([0, 0]);
  ctx.beginPath();
  ctx.moveTo(opt.leftOffset, opt.heightZero);
  ctx.stroke();

  for (var i = 1; i < log.length; i++) {
    if (log[i].eng > 1104) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.setLineDash([0, 0]);
      ctx.beginPath();
      ctx.moveTo(opt.leftOffset + log[i-1].second * opt.pixelPerScale, opt.heightZero - (log[i-1].altitude) * opt.pixelPerScale);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([0, 0]);
      ctx.beginPath();
      ctx.moveTo(opt.leftOffset + log[i-1].second * opt.pixelPerScale, opt.heightZero - (log[i-1].altitude) * opt.pixelPerScale);
    }
    ctx.lineTo(opt.leftOffset + log[i].second * opt.pixelPerScale, opt.heightZero - (log[i].altitude) * opt.pixelPerScale);
    ctx.stroke();
  }
}

const canvas = document.getElementById("field");
const log = document.querySelector('.log');
const fileList = document.querySelector('.file__list');
let currentColor = 0;

const opt = fieldInit(canvas, 300, 600);

const input = document.getElementById('inputFile');

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

input.addEventListener('change', (evt) => {
  let fileLength = evt.currentTarget.files.length;
  if (fileLength) {
    for (let i = 0; i < fileLength; i++) {
      const fileName = evt.currentTarget.files[i].name;
      const reader = new FileReader();
      reader.onload = function(event) {
        let contents = event.target.result;
        graph(log, fileList, fileName, JSON.parse(contents), opt, colors[currentColor]);
        currentColor++;
      };
      reader.readAsText(evt.currentTarget.files[i]);
    }
  }
})
