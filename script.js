const tableBody = document.querySelector("#facilityTable tbody");
const form = document.getElementById("filterForm");

function calculateFakeDistance(zip1, zip2) {
  return Math.abs(parseInt(zip1) - parseInt(zip2)); // dummy placeholder
}

function getSelectedOptions(select) {
  return Array.from(select.selectedOptions).map(option => option.value.toLowerCase());
}

function renderFacilities(data, userZip = null) {
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
      <td>${userZip ? calculateFakeDistance(userZip, f.zip) + " miles" : "—"}</td>
      <td>${f.requirements || "—"}</td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const selectedCaseTypes = getSelectedOptions(document.getElementById("caseTypeDropdown"));
  const insurance = document.getElementById("insuranceDropdown").value.toLowerCase();
  const zip = document.getElementById("zipCode").value;

  const filtered = facilities.filter(f => {
    const ageOk = !age || (age >= f.ages[0] && age <= f.ages[1]);
    const genderOk = !gender || (gender === "male" ? f.maleBeds > 0 : f.femaleBeds > 0);
    const insuranceOk = !insurance || f.insurances.some(i => i.toLowerCase().includes(insurance));

    // Convert all facility case types to lowercase for consistent comparison
    const facilityCases = f.cases.map(c => c.toLowerCase());

    // Make sure EVERY selected case is included in the facility's cases
    const caseOk = selectedCaseTypes.every(selected => facilityCases.includes(selected));

    return ageOk && genderOk && insuranceOk && caseOk;
  });

  const sorted = zip
    ? filtered.sort((a, b) => calculateFakeDistance(zip, a.zip) - calculateFakeDistance(zip, b.zip))
    : filtered;

  renderFacilities(sorted, zip);
});

document.querySelectorAll("th[data-sort]").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    facilities.sort((a, b) => {
      if (key === "name" || key === "zip") return a[key].localeCompare(b[key]);
      if (key === "distance") return 0;
      return b[key] - a[key];
    });
    renderFacilities(facilities);
  });
});

renderFacilities(facilities);
