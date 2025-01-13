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
      document.querySelector(".add-color-btn").textContent =
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
  document.querySelector(".remove-color-btn").textContent = "Add More Colors";
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
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;
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
    "Switch to Saved"
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
  const selectedGradients =
    JSON.parse(localStorage.getItem("selectedGradients")) || [];
  selectedGradients.push(selectedGradient);
  localStorage.setItem("selectedGradients", JSON.stringify(selectedGradients));
  loadGradients();
  forBackground();
}

function loadGradients() {
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  const selectedGradients =
    JSON.parse(localStorage.getItem("selectedGradients")) || [];
  gradientContent.innerHTML = ""; // Clear current list

  const gradients =
    document.querySelector(".historyContainer").children[0].children[1]
      .children[0].innerHTML === "Saved Gradients"
      ? selectedGradients
      : gradientsHistory;
  gradients.reverse().forEach((gradient, index) => {
    const div = document.createElement("div");
    div.className = "gradientColor";
    div.style = `${gradient.gradient}`;
    div.innerHTML = `
                          <div>
                            <b>${gradient.gradient.slice(28, -2)}</b>
                          </div>
                          <div>Generated on: ${new Date(
                            gradient.timestamp
                          ).toLocaleString()}</div>
                          <div class="gradientDeleteIcon" onclick="deleteGradient(${
                            (gradient.timestamp, index)
                          })">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5555 4C10.099 4 9.70052 4.30906 9.58693 4.75114L9.29382 5.8919H14.715L14.4219 4.75114C14.3083 4.30906 13.9098 4 13.4533 4H10.5555ZM16.7799 5.8919L16.3589 4.25342C16.0182 2.92719 14.8226 2 13.4533 2H10.5555C9.18616 2 7.99062 2.92719 7.64985 4.25342L7.22886 5.8919H4C3.44772 5.8919 3 6.33961 3 6.8919C3 7.44418 3.44772 7.8919 4 7.8919H4.10069L5.31544 19.3172C5.47763 20.8427 6.76455 22 8.29863 22H15.7014C17.2354 22 18.5224 20.8427 18.6846 19.3172L19.8993 7.8919H20C20.5523 7.8919 21 7.44418 21 6.8919C21 6.33961 20.5523 5.8919 20 5.8919H16.7799ZM17.888 7.8919H6.11196L7.30423 19.1057C7.3583 19.6142 7.78727 20 8.29863 20H15.7014C16.2127 20 16.6417 19.6142 16.6958 19.1057L17.888 7.8919ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"/>
                            </svg>
                          </div>
                        `;
    gradientContent.appendChild(div);
  });
}

function downloadGradientsHistory() {
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  const blob = new Blob([JSON.stringify(gradientsHistory, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "gradientsHistory.json";
  link.click();
}

function downloadSelectedGradients() {
  const selectedGradients =
    JSON.parse(localStorage.getItem("selectedGradients")) || [];
  const blob = new Blob([JSON.stringify(selectedGradients, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "selectedGradients.json";
  link.click();
}

function downloadGradients() {
  downloadGradientsHistory();
  downloadSelectedGradients();
}

function clearGradients() {
  localStorage.removeItem("gradientsHistory");
  localStorage.removeItem("selectedGradients");
  loadGradients();
  console.log("All gradients have been cleared from local storage.");
}

function deleteGradientsHistory() {
  localStorage.removeItem("gradientsHistory");
  loadGradients();
  console.log("Gradients History have been cleared from local storage.");
}

function deleteSelectedGradients() {
  localStorage.removeItem("selectedGradients");
  loadGradients();
  console.log("All Selected gradients have been cleared from local storage.");
}

function deleteGradient(timestamp, index) {
  const gradientsHistory =
    JSON.parse(localStorage.getItem("gradientsHistory")) || [];
  const selectedGradients =
    JSON.parse(localStorage.getItem("selectedGradients")) || [];

  if (
    (index >= 0 && index < gradientsHistory.length) ||
    selectedGradients.length
  ) {
    gradientsHistory.filter((gradient) => gradient.timestamp !== timestamp);
    selectedGradients.filter((gradient) => gradient.timestamp !== timestamp);
    // gradients.splice(index, 1);

    localStorage.setItem("gradientsHistory", JSON.stringify(gradientsHistory));
    localStorage.setItem(
      "selectedGradients",
      JSON.stringify(selectedGradients)
    );
    loadGradients();
    console.log(`Gradient at index ${index} has been deleted.`);
  } else {
    console.log("Invalid index.");
  }
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
  container.children[0].children[1].children[0].innerHTML = "Saved Gradients";
  container.children[0].children[1].children[1].setAttribute(
    "data-bs-title",
    "Download Saved"
  );
  container.children[0].children[1].children[1].setAttribute(
    "onclick",
    "downloadSelectedGradients()"
  );
  container.children[0].children[2].setAttribute(
    "data-bs-title",
    "Delete Saved"
  );
  container.children[0].children[2].setAttribute(
    "onclick",
    "deleteSelectedGradients()"
  );
  container.children[1].innerHTML = "";

  // Update tooltips
  toolTipTrigger();
  loadGradients();
}

function forBackground() {
  const selectedGradients =
    JSON.parse(localStorage.getItem("selectedGradients")) || [];
  if (selectedGradients.length) {
    const randomGradient =
      selectedGradients[Math.floor(Math.random() * selectedGradients.length)];
    const bgGradient = randomGradient.gradient.slice(11, -1);
    document.querySelector("body").style.background = bgGradient;
  } else {
    document.querySelector("body").style.background =
      "linear-gradient(to top, #abf967, #f63dc0)";
  }
}
forBackground();

// Initialize with default preview
generateRandomGradient();
