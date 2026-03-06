(() => {
  const form = document.getElementById("onboarding-form");
  const onboardingSection = document.getElementById("onboarding-section");
  const simulationSection = document.getElementById("simulation-section");
  const learnerNameInput = document.getElementById("learner-name");
  const learnerEmailInput = document.getElementById("learner-email");
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const learnerNameDisplay = document.getElementById("learner-name-display");
  const resetSessionBtn = document.getElementById("reset-session-btn");

  const insulinSlider = document.getElementById("insulin-slider");
  const bloodSugarSlider = document.getElementById("blood-sugar-slider");
  const insulinValue = document.getElementById("insulin-value");
  const bloodSugarValue = document.getElementById("blood-sugar-value");
  const eatBtn = document.getElementById("eat-btn");

  const receptorCount = document.getElementById("receptor-count");
  const cellSugarValue = document.getElementById("cell-sugar-value");
  const metricBloodSugar = document.getElementById("metric-blood-sugar");
  const metricInsulin = document.getElementById("metric-insulin");
  const metricUptake = document.getElementById("metric-uptake");
  const bindingStatus = document.getElementById("binding-status");
  const bloodSugarParticles = document.getElementById("blood-sugar-particles");

  if (
    !form ||
    !onboardingSection ||
    !simulationSection ||
    !learnerNameInput ||
    !learnerEmailInput
  ) {
    return;
  }

  const state = {
    insulin: Number(insulinSlider.value),
    bloodSugar: Number(bloodSugarSlider.value),
    cellSugar: 0,
  };

  const clamp = (num, min, max) => Math.min(max, Math.max(min, num));
  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  function updateParticleView() {
    const count = clamp(Math.round((state.bloodSugar - 70) / 12), 2, 18);
    bloodSugarParticles.innerHTML = "";

    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement("span");
      dot.className =
        "mr-1 mt-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-500/80";
      bloodSugarParticles.appendChild(dot);
    }
  }

  function updateSimulationView() {
    insulinValue.textContent = String(state.insulin);
    bloodSugarValue.textContent = String(state.bloodSugar);
    receptorCount.textContent = String(Math.floor(state.insulin / 10));
    cellSugarValue.textContent = `${state.cellSugar.toFixed(1)} mg/dL`;

    metricBloodSugar.textContent = `${state.bloodSugar} mg/dL`;
    metricInsulin.textContent = `${state.insulin} units`;
    metricUptake.textContent = `${state.cellSugar.toFixed(1)} mg/dL`;

    const insulinBound = state.insulin >= 25;
    bindingStatus.textContent = insulinBound
      ? "Insulin bound to receptor"
      : "Insulin not bound";
    bindingStatus.className = insulinBound
      ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
      : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800";

    updateParticleView();
  }

  function runAbsorptionStep() {
    const insulinBound = state.insulin >= 25;
    if (!insulinBound || state.bloodSugar <= 70) return;

    const uptake = Math.min(
      (state.insulin / 100) * 2.2,
      Math.max(0, state.bloodSugar - 70)
    );

    state.bloodSugar = clamp(Math.round((state.bloodSugar - uptake) * 10) / 10, 70, 280);
    state.cellSugar = clamp(state.cellSugar + uptake, 0, 9999);
    bloodSugarSlider.value = String(Math.round(state.bloodSugar));
    updateSimulationView();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = learnerNameInput.value.trim();
    const email = learnerEmailInput.value.trim();
    const validName = name.length > 0;
    const validEmail = isEmailValid(email);

    nameError.classList.toggle("hidden", validName);
    emailError.classList.toggle("hidden", validEmail);

    if (!validName || !validEmail) return;

    learnerNameDisplay.textContent = name;
    onboardingSection.classList.add("hidden");
    simulationSection.classList.remove("hidden");
    updateSimulationView();
  });

  insulinSlider.addEventListener("input", () => {
    state.insulin = Number(insulinSlider.value);
    updateSimulationView();
  });

  bloodSugarSlider.addEventListener("input", () => {
    state.bloodSugar = Number(bloodSugarSlider.value);
    updateSimulationView();
  });

  eatBtn.addEventListener("click", () => {
    state.bloodSugar = clamp(state.bloodSugar + 18, 70, 280);
    bloodSugarSlider.value = String(Math.round(state.bloodSugar));
    updateSimulationView();
  });

  resetSessionBtn.addEventListener("click", () => {
    form.reset();
    learnerNameDisplay.textContent = "-";
    nameError.classList.add("hidden");
    emailError.classList.add("hidden");
    onboardingSection.classList.remove("hidden");
    simulationSection.classList.add("hidden");

    state.insulin = 20;
    state.bloodSugar = 110;
    state.cellSugar = 0;
    insulinSlider.value = "20";
    bloodSugarSlider.value = "110";
    updateSimulationView();
  });

  updateSimulationView();
  window.setInterval(runAbsorptionStep, 1000);
})();
