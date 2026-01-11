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
updatePixelResolution();

function toggleResolutionInputs() {
  const container = document.getElementById("pixelResolutionContainer");
  const isExpanded = container.classList.contains("expanded");

  if (isExpanded) {
    container.classList.remove("expanded");
  } else {
    container.classList.add("expanded");
    // Focus on width input when expanded
    setTimeout(() => document.getElementById("pixelWidth").focus(), 100);
  }
}

// Close expanded view when clicking outside
document.addEventListener("click", function (event) {
  const container = document.getElementById("pixelResolutionContainer");
  if (container && !container.contains(event.target)) {
    container.classList.remove("expanded");
  }
});

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

const debounce = (func, delay) => {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

color1.addEventListener("input", debounce(updatePreview, 300));
color2.addEventListener("input", debounce(updatePreview, 300));
direction.addEventListener("change", debounce(updatePreview, 300));
gradientCode.addEventListener("input", debounce(gradCodeInputChange, 300));

function updatePixelResolution() {
  const width = document.getElementById("pixelWidth").value;
  const height = document.getElementById("pixelHeight").value;

  if (width && height && width > 0 && height > 0) {
    const resolution = {
      width: parseInt(width),
      height: parseInt(height),
    };

    // console.log("Pixel Resolution Updated:", resolution);
    // console.log(`Resolution: ${resolution.width} × ${resolution.height}`);
    //  // console.log(
    //     `Aspect Ratio: ${(resolution.width / resolution.height).toFixed(4)}`
    //   );
    //  // console.log(
    //     `Total Pixels: ${(resolution.width * resolution.height).toLocaleString()}`
    //   );
    // console.log(`DPI Comparison: ${resolution.width}p width`);
  }
}

function updatePercentageValue(value) {
  document.getElementById("percentageValue").innerHTML = value;
  document.querySelector("#percentageValue").nextElementSibling.innerHTML =
    value > 1 ? "Gradients" : "Gradient";
  document.getElementById("percentageRange").title = value;
}

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
    const liveToast = document.querySelector("#liveToast");
    liveToast.children[0].children[0].innerHTML = "Successfully Copied!";
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
    newColor.addEventListener("input", debounce(updatePreview, 300));

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
  const randomDirection = () =>
    [
      "to right",
      "to bottom",
      "to top right",
      "to bottom right",
      "to top",
      "to left",
      "to top left",
    ][Math.floor(Math.random() * 7)];

  const count = parseInt(document.getElementById("percentageValue").innerHTML);
  if (count > 1) {
    const validGradients = [];
    for (let i = 0; i < count; i++) {
      const colors = Array.from(
        { length: colorInputs.length },
        randomColor
      ).join(", ");
      const gradient = {
        timestamp: new Date().toISOString(),
        gradient: `background: linear-gradient(${randomDirection()}, ${colors});`,
      };
      validGradients.push(gradient);
    }

    // Save to localStorage
    const gradientsHistory =
      JSON.parse(localStorage.getItem("gradientsHistory")) || [];
    validGradients.map((grad) => gradientsHistory.push(grad));
    localStorage.setItem("gradientsHistory", JSON.stringify(gradientsHistory));
    liveToastMessage(
      `${count} Gradients Generated Successfully!`,
      "Switch to History Page For Generated Gradients."
    );

    colorInputs.forEach(
      (input, index) =>
        (input.value = validGradients
          .slice(-1)[0]
          .gradient.slice(28, -2)
          .split(", ")[index + 1])
    );
    direction.value = validGradients
      .slice(-1)[0]
      .gradient.slice(28, -2)
      .split(", ")[0];
    updatePreview();
  }

  colorInputs.forEach((input) => (input.value = randomColor()));
  direction.value = randomDirection();
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

function savedToSelected(gradCode) {
  // Create gradient object with timestamp
  const selectedGradient = {
    timestamp: new Date().toISOString(),
    gradient: gradCode || gradientCode.value,
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
      div.innerHTML = `<div><b onclick="redirectToGradEditor('${
        gradient.gradient
      }')">${gradient.gradient.slice(28, -2)}</b></div><div>${
        gradient.timestamp
          ? "Generated on:" + new Date(gradient.timestamp).toLocaleString()
          : ""
      }</div><div class="gradientDeleteIcon" onclick="deleteGradient(${gradLoaction}, ${index}, '${
        gradient.gradient
      }')"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"/></svg></div>`;
      gradientContent.appendChild(div);
      if (!gradLoaction) {
        div.innerHTML += `<button
            class="save-btn btn-sm"
            onclick="savedToSelected('${gradient.gradient}')"
          >
            Save
          </button>`;
      }
    });
  gradLoaction
    ? gradients.length || gradNotExist("Favourite Gradient not saved yet!")
    : gradients.length || gradNotExist("Not generated Random Gradient yet!");
  toolTipTrigger();
}

function downloadGradientsHistory() {
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  if (!gradientsHistory.length) {
    return liveToastMessage(
      "<span style='color:red;'>Gradients Not found in History</span>",
      "Generate Gradients then do download"
    );
  }
  downloadGradientsAsZip(
    "gradientsHistory",
    gradientsHistory.map((color) => {
      return color.gradient;
    })
  );
  liveToastMessage("Gradient History Downloaded!", "File gradientsHistory.zip");
}

function downloadfavouriteGradients() {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")) || [];
  if (!favouriteGradients.length) {
    return liveToastMessage(
      "<span style='color:red;'>Gradients Not found in Favourites</span>",
      "Save Gradients to Favourite then do download"
    );
  }
  downloadGradientsAsZip(
    "favouriteGradients",
    favouriteGradients.map((color) => {
      return color.gradient;
    })
  );
  liveToastMessage(
    "Gradient Favourited Downloaded!",
    "File is favouriteGradients.zip"
  );
}

function downloadGradients() {
  const favouriteGradients =
    JSON.parse(localStorage.getItem("favouriteGradients")) || [];
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];

  if (!favouriteGradients.length && !gradientsHistory.length) {
    return liveToastMessage(
      "<span style='color:red;'>Gradients Not found in Favourites & History</span>",
      "Save Gradients to Favourite & Generate Gradients then do download"
    );
  }
  downloadAllGradientsAsZip(
    favouriteGradients.map((color) => {
      return color.gradient;
    }),
    gradientsHistory.map((color) => {
      return color.gradient;
    })
  );
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
  //// console.log(
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
  //// console.log(favouriteGradients);
  if (favouriteGradients.length) {
    const randomGradient =
      favouriteGradients[Math.floor(Math.random() * favouriteGradients.length)];
    //// console.log(randomGradient);
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
  titles[0].style.background = gradient.slice(12, -1);
  titles[0].style.webkitBackgroundClip = "text";
  titles[0].style.color = "transparent";
  gc.style.background = gradient.slice(12, -1);
  gradientCode.value = gradient;
  preview.style.background = gradient.slice(12, -1);
  const gradCodeArray = gradient.slice(28, -2).split(", ");
  direction.value = gradCodeArray[0];

  colorInputs[0].value = gradCodeArray[1];
  colorInputs[1].value = gradCodeArray[2];

  if (gradCodeArray.length === 4) {
    colorInputs[3] && removeColorInputs();
    !colorInputs[2] && addColorInput();
    colorInputs[2].value = gradCodeArray[3];
  }
  if (gradCodeArray.length === 5) {
    !colorInputs[2] && addColorInput();
    !colorInputs[3] && addColorInput();
    colorInputs[2].value = gradCodeArray[3];
    colorInputs[3].value = gradCodeArray[4];
  }
  if (gradCodeArray.length === 3) {
    colorInputs[2] && removeColorInputs();
  }
  toolTipTrigger();
}

function gradCodeInputChange() {
  titles[0].style.background = gradientCode.value.slice(12, -1);
  titles[0].style.webkitBackgroundClip = "text";
  titles[0].style.color = "transparent";
  gc.style.background = gradientCode.value.slice(12, -1);
  preview.style.background = gradientCode.value.slice(12, -1);
  const gradCodeArray = gradientCode.value.slice(28, -2).split(", ");
  direction.value = gradCodeArray[0];

  colorInputs[0].value = gradCodeArray[1];
  colorInputs[1].value = gradCodeArray[2];

  if (gradCodeArray.length === 4) {
    colorInputs[3] && removeColorInputs();
    !colorInputs[2] && addColorInput();
    colorInputs[2].value = gradCodeArray[3];
  }
  if (gradCodeArray.length === 5) {
    !colorInputs[2] && addColorInput();
    !colorInputs[3] && addColorInput();
    colorInputs[2].value = gradCodeArray[3];
    colorInputs[3].value = gradCodeArray[4];
  }
  if (gradCodeArray.length === 3) {
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
  const blob = new Blob(
    [
      JSON.stringify(
        gradients.map((gradient) => {
          return { gradient: gradient };
        }),
        null,
        2
      ),
    ],
    {
      type: "application/json",
    }
  );
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

  const blob1 = new Blob(
    [
      JSON.stringify(
        favouriteGradients.map((gradient) => {
          return { gradient: gradient };
        }),
        null,
        2
      ),
    ],
    {
      type: "application/json",
    }
  );
  const blob2 = new Blob(
    [
      JSON.stringify(
        gradientsHistory.map((gradient) => {
          return { gradient: gradient };
        }),
        null,
        2
      ),
    ],
    {
      type: "application/json",
    }
  );
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

document.querySelector(".importDiv").addEventListener("click", function () {
  document.getElementById("fileInput").click();
});

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    document.querySelector(".importDiv").children[0].style.display = "none";
    document.querySelector(".importDiv").children[1].innerHTML =
      "Importing ...";
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const gradientsArray = JSON.parse(e.target.result);

          // Allowed directions
          const allowedDirections = [
            "to right",
            "to bottom",
            "to top right",
            "to bottom right",
            "to top",
            "to left",
            "to top left",
          ];

          // Validate gradient format
          const validGradients = gradientsArray.filter((gradient) => {
            const regex =
              /^background:\s*linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]{6}(,\s*#[0-9a-fA-F]{6}){1,3})\);?$/;
            const match = gradient.gradient.match(regex);

            if (!match) {
              document.querySelector(".importDiv").children[0].style.display =
                "inline-block";
              document.querySelector(".importDiv").children[1].innerHTML =
                "Import";
              return liveToastMessage(
                '<span style="color:red;">Format not matched!</span>',
                "[ { 'gradient': 'background: linear-gradient(to left, #d2681f, #de45ac);'}, ...]"
              );
            }

            const [_, direction, colors] = match;
            const colorsCount = colors.split(",").length;

            return (
              allowedDirections.includes(direction.trim()) &&
              colorsCount >= 2 &&
              colorsCount <= 4
            );
          });

          if (validGradients.length > 0) {
            const favouriteGradients =
              JSON.parse(localStorage.getItem("favouriteGradients")) || [];
            validGradients.map((grad) => favouriteGradients.push(grad));
            localStorage.setItem(
              "favouriteGradients",
              JSON.stringify(favouriteGradients)
            );
            document.querySelector(".importDiv").children[0].style.display =
              "inline-block";
            document.querySelector(".importDiv").children[1].innerHTML =
              "Import";
            liveToastMessage(
              "Imported Successfully!",
              "Gradients were successfully imported to Favorites"
            );
          } else {
            document.querySelector(".importDiv").children[0].style.display =
              "inline-block";
            document.querySelector(".importDiv").children[1].innerHTML =
              "Import";
            liveToastMessage(
              '<span style="color:red;">Not Imported Successfully!</span>',
              "No valid gradients found in the imported File"
            );
          }
        } catch (error) {
          document.querySelector(".importDiv").children[0].style.display =
            "inline-block";
          document.querySelector(".importDiv").children[1].innerHTML = "Import";
          liveToastMessage(
            '<span style="color:red;">Not Imported Successfully!</span>',
            "Invalid JSON file"
          );
        }
      };
      reader.readAsText(file);
    }
  });

// Initialize with default preview
generateRandomGradient();

function getUrlValues() {
  //// console.log("enter to getUrlValues");

  const keys = [
    "direction",
    "color1",
    "color2",
    "color3",
    "color4",
    "width",
    "height",
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const result = {};

  keys.forEach((key) => {
    const value = urlParams.get(key);
    if (value !== null) {
      result[key] = value;
    }
  });
  //// console.log("end to getUrlValues");

  return result;
}

function generateGradientFromUrl() {
  //// console.log("enter to generateGradientFromUrl");

  const values = getUrlValues();
  const direction = values.direction;
  const colors = [
    values.color1,
    values.color2,
    values.color3,
    values.color4,
  ].filter(Boolean);
  const width = parseInt(values.width);
  const height = parseInt(values.height);

  if (colors.length < 2) {
    // console.error("At least two colors are required to generate a gradient.");
    return;
  }

  const gradientStyle = `linear-gradient(${direction}, ${colors.join(", ")})`;
  const imageDataUrl = generateGradientImage(
    `background:${gradientStyle}`,
    width,
    height
  );
  const link = document.createElement("a");
  link.href = imageDataUrl;
  link.download = "gradient.png";
  link.click();
  // console.log("end to generateGradientFromUrl");
}

window.onload = () => {
  // console.log("enter to onload");

  generateGradientFromUrl();
  // console.log("after to onload");
};
