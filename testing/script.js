function autoGenerate() {
  const letter = document.querySelector(".imageLetter").value || "A";
  const bgColor = document.querySelector(".bgColor").value || "transparent";
  const textColor = document.querySelector(".textColor").value || "#000000";
  const width = parseInt(document.querySelector(".width").value) || 250;
  const height = parseInt(document.querySelector(".height").value) || 250;
  const shape = document.querySelector(".shape-options").value;
  const shadow = document.querySelector(".shadow-options").value;
  const format = document.querySelector(".file-format-options").value;
  const percentage = parseInt(document.querySelector(".percentage").value);

  document.getElementById("percentageValue").textContent = `${percentage}%`;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  if (shadow !== "none") {
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur =
      shadow === "small"
        ? 5
        : shadow === "medium"
        ? 10
        : shadow === "large"
        ? 20
        : 30;
    ctx.shadowOffsetX = shadow === "3d" ? 10 : 0;
    ctx.shadowOffsetY = shadow === "3d" ? 10 : 0;
  }

  ctx.fillStyle = shape === "transparent" ? "rgba(0, 0, 0, 0)" : bgColor;

  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 2}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, width / 2, height / 2);

  const output = document.getElementById("output-container");
  output.innerHTML = `<img src="${canvas.toDataURL(
    `image/${format}`
  )}" alt="Generated Image" class="img-fluid" style="border-radius: ${percentage}%">`;

  const downloadBtn = document.getElementById("download-btn");
  downloadBtn.style.display = "block";
  downloadBtn.onclick = () => downloadImage(canvas, format, percentage);
}

function downloadImage(canvas, format, percentage) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  tempCtx.beginPath();
  const radius =
    (Math.min(tempCanvas.width, tempCanvas.height) * percentage) / 100;
  if (percentage > 0) {
    tempCtx.moveTo(radius, 0);
    tempCtx.lineTo(tempCanvas.width - radius, 0);
    tempCtx.quadraticCurveTo(tempCanvas.width, 0, tempCanvas.width, radius);
    tempCtx.lineTo(tempCanvas.width, tempCanvas.height - radius);
    tempCtx.quadraticCurveTo(
      tempCanvas.width,
      tempCanvas.height,
      tempCanvas.width - radius,
      tempCanvas.height
    );
    tempCtx.lineTo(radius, tempCanvas.height);
    tempCtx.quadraticCurveTo(
      0,
      tempCanvas.height,
      0,
      tempCanvas.height - radius
    );
    tempCtx.lineTo(0, radius);
    tempCtx.quadraticCurveTo(0, 0, radius, 0);
  } else {
    tempCtx.rect(0, 0, tempCanvas.width, tempCanvas.height);
  }
  tempCtx.closePath();
  tempCtx.clip();

  tempCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = `generated-image.${format}`;
  link.href = tempCanvas.toDataURL(`image/${format}`);
  link.click();
}

// Automatically generate on input change
document
  .querySelectorAll(
    ".imageLetter, .bgColor, .textColor, .width, .height, .shape-options, .percentage, .shadow-options, .file-format-options"
  )
  .forEach((input) => {
    input.addEventListener("input", autoGenerate);
  });

autoGenerate(); // Generate on initial load
