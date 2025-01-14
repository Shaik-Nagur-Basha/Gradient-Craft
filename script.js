// Initialize Bootstrap tooltips
function toolTipTrigger() {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    var tooltip = new bootstrap.Tooltip(tooltipTriggerEl);
    tooltipTriggerEl.addEventListener("mouseleave", function () {
      tooltip.hide();
    });
    return tooltip;
  });
}
toolTipTrigger();

const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const direction = document.getElementById("direction");
const preview = document.getElementById("preview");
const gradientCode = document.getElementById("gradientCode");
const extraColorsDiv = document.getElementById("extraColors");
const titles = document.querySelectorAll("h1");
const gradientContent = document.querySelector(".gradientContent");

const gc = document.querySelector(".gc");
let colorInputs = [color1, color2];

color1.addEventListener("input", updatePreview);
color2.addEventListener("input", updatePreview);
direction.addEventListener("change", updatePreview);

function updatePreview() {
  let gradDirection = direction.value;
  let gradColors = colorInputs.map((input) => input.value).join(", ");
  let gradientStyle = `linear-gradient(${gradDirection}, ${gradColors})`;

  preview.style.background = gradientStyle;
  gc.style.background = gradientStyle;
  gradientCode.value = `background: ${gradientStyle};`;
  titles[0].style.background = gradientStyle;
  titles[0].style.webkitBackgroundClip = "text";
  titles[0].style.color = "transparent";

  // Create gradient object with timestamp
  const gradient = {
    timestamp: new Date().toISOString(),
    gradient: `background: ${gradientStyle};`,
  };

  // Save to localStorage
  saveGradientToHistory(gradient);
  loadGradients();
}

function copyCode() {
  navigator.clipboard.writeText(gradientCode.value).then(() => {
    const toastBody = document.querySelector(".toast-body");
    toastBody.innerHTML = gradientCode.value;
    const toastTrigger = document.getElementById("liveToastBtn");
    const toastLiveExample = document.getElementById("liveToast");

    if (toastTrigger) {
      const toastBootstrap =
        bootstrap.Toast.getOrCreateInstance(toastLiveExample);
      toastBootstrap.show();
    }
  });
}

function liveToastMessage(headerMessage, bodyMessage) {
  const liveToast = document.querySelector("#liveToast");
  liveToast.children[0].children[0].innerHTML = headerMessage;
  liveToast.children[1].innerHTML = bodyMessage;
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(liveToast);
  toastBootstrap.show();
}

function addColorInput() {
  if (colorInputs.length < 4) {
    const newColorInput = document.createElement("div");
    newColorInput.classList.add("input-container");
    newColorInput.innerHTML = `
            <label class="input-label" for="color${
              colorInputs.length + 1
            }">Color ${colorInputs.length + 1}:</label>
            <input type="color" id="color${
              colorInputs.length + 1
            }" class="form-control" value="#ff0000" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Color ${
      colorInputs.length + 1
    }" />
          `;
    extraColorsDiv.appendChild(newColorInput);
    const newColor = newColorInput.querySelector("input");
    colorInputs.push(newColor);
    newColor.addEventListener("input", updatePreview);

    colorInputs.length === 3 &&
      document
        .querySelector(".add-color-btn")
        .setAttribute("data-bs-title", "Add Color 4");
    if (colorInputs.length === 4) {
      document.querySelector(".add-color-btn").innerHTML =
        "Remove Added Colors";
      document
        .querySelector(".add-color-btn")
        .setAttribute("data-bs-title", "Remove Color 3 & 4");
      document
        .querySelector(".add-color-btn")
        .classList.replace("add-color-btn", "remove-color-btn");
      document
        .getElementById("rcb")
        .setAttribute("onclick", "removeColorInputs()");
    }
    toolTipTrigger();
  }
}

function removeColorInputs() {
  extraColorsDiv.innerHTML = "";
  colorInputs = [color1, color2];
  document.querySelector(".remove-color-btn").innerHTML = "Add More Colors";
  document
    .querySelector(".remove-color-btn")
    .classList.replace("remove-color-btn", "add-color-btn");
  document.querySelector("#rcb").setAttribute("data-bs-title", "Add Color 3");
  document.getElementById("rcb").setAttribute("onclick", "addColorInput()");

  updatePreview();
  toolTipTrigger();
}

function generateRandomGradient() {
  const randomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  const randomDirection = [
    "to right",
    "to bottom",
    "to top right",
    "to bottom right",
    "to top",
    "to left",
    "to top left",
  ][Math.floor(Math.random() * 7)];

  colorInputs.forEach((input) => (input.value = randomColor()));
  direction.value = randomDirection;
  updatePreview();
}

function historyPage() {
  const body = document.querySelector("body");
  const bgGradient = preview.style.background;
  body.children[0].style.display = "none";
  body.children[2].style.display = "inline-block";

  titles[1].style.background = bgGradient;
  titles[1].style.webkitBackgroundClip = "text";
  titles[1].style.color = "transparent";

  const container = document.querySelector(".historyContainer");
  container.children[0].children[0].children[0].setAttribute(
    "data-bs-title",
    "Switch to Home"
  );
  container.children[0].children[0].children[0].setAttribute(
    "onclick",
    "homePage()"
  );
  container.children[0].children[0].children[1].setAttribute(
    "data-bs-title",
    "Switch to Favourite"
  );
  container.children[0].children[0].children[1].setAttribute(
    "onclick",
    "savedPage()"
  );
  container.children[0].children[1].children[0].innerHTML =
    "Gradient Craft History";
  container.children[0].children[1].children[1].setAttribute(
    "data-bs-title",
    "Download History"
  );
  container.children[0].children[1].children[1].setAttribute(
    "onclick",
    "downloadGradientsHistory()"
  );
  container.children[0].children[2].setAttribute(
    "data-bs-title",
    "Delete History"
  );
  container.children[0].children[2].setAttribute(
    "onclick",
    "deleteGradientsHistory()"
  );

  // Update tooltips
  toolTipTrigger();
  // body.style.background = bgGradient;
  loadGradients();
}

function homePage() {
  const body = document.querySelector("body");
  body.children[0].style.display = "flex";
  body.children[2].style.display = "none";
}

// Load existing gradients from localStorage on page load
window.onload = loadGradients;

function saveGradientToHistory(historyGradient) {
  const historyGradients =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  historyGradients.push(historyGradient);
  localStorage.setItem("gradientsHistory", JSON.stringify(historyGradients));
}

function savedToSelected() {
  // Create gradient object with timestamp
  const selectedGradient = {
    timestamp: new Date().toISOString(),
    gradient: gradientCode.value,
  };

  // Save to localStorage
  saveGradientToSelected(selectedGradient);
}

function saveGradientToSelected(selectedGradient) {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")) || [];
  favouriteGradients.push(selectedGradient);
  localStorage.setItem(
    "favouriteGradients",
    JSON.stringify(favouriteGradients)
  );
  liveToastMessage(
    "Successfully Gradient Favourited!",
    `${selectedGradient.gradient}`
  );
  loadGradients();
  forBackground();
}

function loadGradients() {
  var gradLoaction;
  let gradients;
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")) || [];
  gradientContent.innerHTML = ""; // Clear current list

  if (
    document.querySelector(".historyContainer").children[0].children[1]
      .children[0].innerHTML === "Favourite Gradients"
  ) {
    gradients = favouriteGradients;
    gradLoaction = 1;
  } else {
    gradients = gradientsHistory;
    gradLoaction = 0;
  }

  gradients.length && gradExist();
  gradients.length &&
    gradients.reverse().forEach((gradient, index) => {
      const div = document.createElement("div");
      div.className = "gradientColor";
      div.style = `${gradient.gradient}`;
      div.innerHTML = `
                          <div>
                            <b onclick="redirectToGradEditor('${
                              gradient.gradient
                            }')">${gradient.gradient.slice(28, -2)}</b>
                          </div>
                          <div>${
                            gradient.timestamp &&
                            "Generated on:" +
                              new Date(gradient.timestamp).toLocaleString()
                          }</div>
                          <div class="gradientDeleteIcon" onclick="deleteGradient(${gradLoaction}, ${index}, '${
        gradient.gradient
      }')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"/>
                            </svg>
                          </div>
                        `;
      gradientContent.appendChild(div);
    });
  gradLoaction
    ? gradients.length || gradNotExist("Favourite Gradient not saved yet!")
    : gradients.length || gradNotExist("Not generated Random Gradient yet!");
}

function downloadGradientsHistory() {
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")).map((color) => {
      return color.gradient;
    }) || [];
  downloadGradientsAsZip("gradientsHistory", gradientsHistory);
  liveToastMessage("Gradient History Downloaded!", "File gradientsHistory.zip");
}

function downloadfavouriteGradients() {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")).map((color) => {
      return color.gradient;
    }) || [];
  downloadGradientsAsZip("favouriteGradients", favouriteGradients);
  liveToastMessage(
    "Gradient Favourited Downloaded!",
    "File is favouriteGradients.zip"
  );
}

function downloadGradients() {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")).map((color) => {
      return color.gradient;
    }) || [];
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")).map((color) => {
      return color.gradient;
    }) || [];
  downloadAllGradientsAsZip(favouriteGradients, gradientsHistory);
  liveToastMessage(
    "History & Favourited Downloaded!",
    "File gradientsCraft.zip"
  );
}

function clearGradients() {
  localStorage.removeItem("gradientsHistory");
  localStorage.removeItem("favouriteGradients");
  loadGradients();
  liveToastMessage(
    "Successfully DELETED History & Favourite!",
    "All gradients have been cleared from local storage."
  );
}

function deleteGradientsHistory() {
  localStorage.removeItem("gradientsHistory");
  loadGradients();
  liveToastMessage(
    "Successfully DELETED History!",
    "Gradients History have been cleared from local storage."
  );
}

function deletefavouriteGradients() {
  localStorage.removeItem("favouriteGradients");
  loadGradients();
  liveToastMessage(
    "Successfully DELETED Favourite!",
    "Favourite Gradients have been cleared from local storage."
  );
}

function deleteGradient(gradLoaction, index, gradientCode) {
  // console.log(
  //   "After Trigger",
  //   "gradLoaction = ",
  //   gradLoaction,
  //   "index = ",
  //   index
  // );

  const gradients =
    JSON.parse(
      localStorage.getItem(
        gradLoaction ? "favouriteGradients" : "gradientsHistory"
      )
    ) || [];
  if (index >= 0 && index < gradients.length) {
    gradients.reverse().splice(index, 1);

    localStorage.setItem(
      gradLoaction ? "favouriteGradients" : "gradientsHistory",
      JSON.stringify(gradients.reverse())
    );
    loadGradients();
    liveToastMessage(
      `${gradLoaction ? "Favourite" : "History"} Gradient at index ${
        index + 1
      } deleted.`,
      gradientCode
    );
  }
}

function gradNotExist(message) {
  gradientContent.innerHTML = message;
  gradientContent.style.padding = "50px";
  gradientContent.style.color = "rgba(255, 0, 0, 0.596)";
  // gradientContent.style.minHeight = "82vh";
}

function gradExist() {
  gradientContent.style.padding = "10px";
  gradientContent.style.color = "";
}

function savedPage() {
  const container = document.querySelector(".historyContainer");
  container.children[0].children[0].children[0].setAttribute(
    "data-bs-title",
    "Switch to History"
  );
  container.children[0].children[0].children[0].setAttribute(
    "onclick",
    "historyPage()"
  );
  container.children[0].children[0].children[1].setAttribute(
    "data-bs-title",
    "Switch to Home"
  );
  container.children[0].children[0].children[1].setAttribute(
    "onclick",
    "homePage()"
  );
  container.children[0].children[1].children[0].innerHTML =
    "Favourite Gradients";
  container.children[0].children[1].children[1].setAttribute(
    "data-bs-title",
    "Download Favourite"
  );
  container.children[0].children[1].children[1].setAttribute(
    "onclick",
    "downloadfavouriteGradients()"
  );
  container.children[0].children[2].setAttribute(
    "data-bs-title",
    "Delete Favourite"
  );
  container.children[0].children[2].setAttribute(
    "onclick",
    "deletefavouriteGradients()"
  );
  container.children[1].innerHTML = "";

  // Update tooltips
  toolTipTrigger();
  loadGradients();
}

function forBackground() {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")) || [];
  if (favouriteGradients.length) {
    const randomGradient =
      favouriteGradients[Math.floor(Math.random() * favouriteGradients.length)];
    const bgGradient = randomGradient.gradient.slice(12, -1);
    document.querySelector("body").style.background = bgGradient;
  } else {
    document.querySelector("body").style.background =
      "linear-gradient(to top, #abf967, #f63dc0)";
  }
}
forBackground();

function redirectToGradEditor(gradient) {
  homePage();
  gradientCode.value = gradient;
  preview.style.background = gradient.slice(12, -1);
  direction.value = gradient.slice(28, -2).split(", ")[0];

  colorInputs[0].value = gradient.slice(28, -2).split(", ")[1];
  colorInputs[1].value = gradient.slice(28, -2).split(", ")[2];

  if (gradient.slice(28, -2).split(", ").length === 4) {
    colorInputs[3] && removeColorInputs();
    !colorInputs[2] && addColorInput();
    colorInputs[2].value = gradient.slice(28, -2).split(", ")[3];
  }
  if (gradient.slice(28, -2).split(", ").length === 5) {
    !colorInputs[2] && addColorInput();
    !colorInputs[3] && addColorInput();
    colorInputs[2].value = gradient.slice(28, -2).split(", ")[3];
    colorInputs[3].value = gradient.slice(28, -2).split(", ")[4];
  }
  if (gradient.slice(28, -2).split(", ").length === 3) {
    colorInputs[2] && removeColorInputs();
  }
  toolTipTrigger();
}
function generateGradientImage(gradient, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const direction = gradient.match(/to [a-z ]+/)?.[0] || "to bottom";
  const colors = gradient.match(/#[0-9a-fA-F]{6}/g);

  const directionsMap = {
    "to bottom": [width / 2, 0, width / 2, height],
    "to top": [width / 2, height, width / 2, 0],
    "to left": [width, height / 2, 0, height / 2],
    "to right": [0, height / 2, width, height / 2],
    "to top left": [width, height, 0, 0],
    "to top right": [0, height, width, 0],
    "to bottom left": [width, 0, 0, height],
    "to bottom right": [0, 0, width, height],
  };
  const coords = directionsMap[direction] || directionsMap["to bottom"];

  const grd = ctx.createLinearGradient(...coords);
  const step = 1 / (colors.length - 1);
  colors.forEach((color, index) => {
    grd.addColorStop(index * step, color);
  });

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/png");
}

function downloadGradientsAsZip(
  message,
  gradients,
  width = 1920,
  height = 1080
) {
  const zip = new JSZip();
  const folder = zip.folder(`${message}`); // Create a folder named 'gradients'
  const blob = new Blob([JSON.stringify(gradients, null, 2)], {
    type: "application/json",
  });
  zip.file(`${message}.json`, blob, { base64: true });

  gradients.forEach((gradient, index) => {
    const imageDataUrl = generateGradientImage(gradient, width, height);
    const imgData = imageDataUrl.split(",")[1];
    folder.file(`${gradient.slice(28, -2)}.png`, imgData, {
      base64: true,
    });
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${message}.zip`;
    link.click();
  });
}

function downloadAllGradientsAsZip(
  favouriteGradients,
  gradientsHistory,
  width = 1920,
  height = 1080
) {
  const zip = new JSZip();
  const folder1 = zip.folder("favouriteGradients");
  const folder2 = zip.folder("gradientsHistory");

  const blob1 = new Blob([JSON.stringify(favouriteGradients, null, 2)], {
    type: "application/json",
  });
  const blob2 = new Blob([JSON.stringify(gradientsHistory, null, 2)], {
    type: "application/json",
  });
  zip.file(`favouriteGradients.json`, blob1, { base64: true });
  zip.file(`gradientsHistory.json`, blob2, { base64: true });

  gradientsHistory.forEach((gradient, index) => {
    const imageDataUrl = generateGradientImage(gradient, width, height);
    const imgData = imageDataUrl.split(",")[1];
    folder1.file(`${gradient.slice(28, -2)}.png`, imgData, {
      base64: true,
    });
  });

  favouriteGradients.forEach((gradient, index) => {
    const imageDataUrl = generateGradientImage(gradient, width, height);
    const imgData = imageDataUrl.split(",")[1];
    folder2.file(`${gradient.slice(28, -2)}.png`, imgData, {
      base64: true,
    });
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `gradientsCraft.zip`;
    link.click();
  });
}

// Initialize with default preview
generateRandomGradient();
