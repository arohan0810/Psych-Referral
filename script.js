const tableBody = document.querySelector("#facilityTable tbody");
const form = document.getElementById("filterForm");
const resetBtn = document.getElementById("resetBtn");

let filteredFacilities = [...facilities]; // start with all
let currentSort = { key: null, ascending: true };
let currentZip = null;

function calculateFakeDistance(zip1, zip2) {
  return Math.abs(parseInt(zip1) - parseInt(zip2)); // dummy placeholder
}

function getSelectedOptions(select) {
  return Array.from(select.selectedOptions).map(option => option.value.toLowerCase());
}

function renderFacilities(data, zip = null) {
  tableBody.innerHTML = "";
  data.forEach((f) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.name}</td>
      <td>${f.maleBeds}</td>
      <td>${f.femaleBeds}</td>
      <td>${f.insurances.join(", ")}</td>
      <td>${f.ages[0]}–${f.ages[1]}</td>
      <td>${f.cases.join(", ")}</td>
      <td>${f.zip}</td>
      <td>${zip ? calculateFakeDistance(zip, f.zip) + " miles" : "—"}</td>
      <td>${f.requirements || "—"}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function applyFilters() {
  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const selectedCaseTypes = getSelectedOptions(document.getElementById("caseTypeDropdown"));
  const insurance = document.getElementById("insuranceDropdown").value.toLowerCase();
  const zip = document.getElementById("zipCode").value;
  currentZip = zip;

  filteredFacilities = facilities.filter(f => {
    const ageOk = !age || (age >= f.ages[0] && age <= f.ages[1]);
    const genderOk = !gender || (gender === "male" ? f.maleBeds > 0 : f.femaleBeds > 0);
    const insuranceOk = !insurance || f.insurances.some(i => i.toLowerCase().includes(insurance));
    const facilityCases = f.cases.map(c => c.toLowerCase());
    const caseOk = selectedCaseTypes.length === 0 || selectedCaseTypes.every(selected => facilityCases.includes(selected));
    return ageOk && genderOk && insuranceOk && caseOk;
  });

  if (zip) {
    filteredFacilities.sort((a, b) => calculateFakeDistance(zip, a.zip) - calculateFakeDistance(zip, b.zip));
  }

  renderFacilities(filteredFacilities, zip);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
});

resetBtn.addEventListener("click", () => {
  form.reset();

  // Clear multi-select manually
  const caseSelect = document.getElementById("caseTypeDropdown");
  Array.from(caseSelect.options).forEach(option => option.selected = false);

  filteredFacilities = [...facilities];
  currentZip = null;
  renderFacilities(filteredFacilities);
});

document.querySelectorAll("th[data-sort]").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    const ascending = currentSort.key === key ? !currentSort.ascending : true;
    currentSort = { key, ascending };

    const listToSort = [...filteredFacilities];
    listToSort.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      if (key === "name" || key === "zip") return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return ascending ? aVal - bVal : bVal - aVal;
    });

    renderFacilities(listToSort, currentZip);
  });
});

// Initial render
renderFacilities(filteredFacilities);
