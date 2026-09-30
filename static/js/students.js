const studentsTableBody = document.getElementById("studentsTableBody");

const filterRoomInput = document.getElementById("filterRoom");
const filterIsuIdInput = document.getElementById("filterIsuId");
const filterGroupInput = document.getElementById("filterGroup");
const filterDormitoryInput = document.getElementById("filterDormitory");
const filterIsForeignSelect = document.getElementById("filterIsForeign");
const filterFullNameInput = document.getElementById("filterFullName");
const filterMoveInDateInput = document.getElementById("filterMoveInDate");
const filterNotesInput = document.getElementById("filterNotes");
const applyFiltersButton = document.getElementById("applyFilters");
const resetFiltersButton = document.getElementById("resetFilters");


function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
}


function readFilters() {
    const filters = {};

    const fullName = filterFullNameInput.value.trim();
    const group = filterGroupInput.value.trim();
    const dormitory = filterDormitoryInput.value.trim();
    const roomNumber = filterRoomInput.value.trim();
    const isuId = filterIsuIdInput.value.trim();
    const moveInDate = filterMoveInDateInput.value;
    const isForeign = filterIsForeignSelect.value;
    const notes = filterNotesInput.value.trim();

    if (fullName) {
        filters.fullName = fullName;
    }

    if (group) {
        filters.group = group;
    }

    if (dormitory) {
        filters.dormitory = Number(dormitory);
    }

    if (roomNumber) {
        filters.roomNumber = Number(roomNumber);
    }

    if (isuId) {
        filters.isuId = Number(isuId);
    }

    if (moveInDate) {
        filters.moveInDate = moveInDate;
    }

    if (isForeign !== "") {
        filters.isForeign = isForeign === "true";
    }

    if (notes) {
        filters.notes = notes;
    }

    return filters;
}


function buildQueryString(filters) {
    const params = new URLSearchParams();

    if (filters.fullName) {
        params.set("fullName", filters.fullName);
    }

    if (filters.group) {
        params.set("group", filters.group);
    }

    if (filters.dormitory) {
        params.set("dormitory", filters.dormitory);
    }

    if (filters.roomNumber) {
        params.set("roomNumber", filters.roomNumber);
    }

    if (filters.isuId) {
        params.set("isuId", filters.isuId);
    }

    if (filters.moveInDate) {
        params.set("moveInDate", filters.moveInDate);
    }

    if (filters.isForeign !== undefined) {
        params.set("isForeign", filters.isForeign);
    }

    if (filters.notes) {
        params.set("notes", filters.notes);
    }

    return params.toString();
}


function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;

    return cell;
}


function createActionButton(text, onClick) {
    const button = document.createElement("button");

    button.textContent = text;
    button.addEventListener("click", onClick);

    return button;
}


function renderStudents(students) {
    studentsTableBody.textContent = "";

    students.forEach(function (student) {
        const row = document.createElement("tr");

        row.appendChild(createCell(student.fullName));
        row.appendChild(createCell(student.group));
        row.appendChild(createCell(student.isuId));
        row.appendChild(createCell(student.dormitoryNumber));
        row.appendChild(createCell(student.roomNumber));
        row.appendChild(createCell(formatDate(student.moveInDate)));

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");

        actions.classList.add("actions");

        actions.appendChild(
            createActionButton("Подробнее", function () {
                window.location.href = "/student-details.html?id=" + student.id;
            })
        );

        actions.appendChild(
            createActionButton("Редактировать", function () {
                window.location.href = "/student-form.html?id=" + student.id;
            })
        );

        actions.appendChild(
            createActionButton("Удалить", async function () {
                const shouldDelete = confirm(
                    "Удалить студента " + student.fullName + "?"
                );

                if (!shouldDelete) {
                    return;
                }

                try {
                    await deleteStudent(student.id);
                    await loadStudents(readFilters());
                } catch (error) {
                    console.error("Ошибка удаления студента:", error);
                }
            })
        );

        actionsCell.appendChild(actions);
        row.appendChild(actionsCell);

        studentsTableBody.appendChild(row);
    });
}


async function loadStudents(filters = {}) {
    try {
        const students = await getAllStudents(filters);
        renderStudents(students);
    } catch (error) {
        console.error("Ошибка загрузки студентов:", error);
    }
}


function applyFilters() {
    const filters = readFilters();
    loadStudents(filters);
}


function resetFilters() {
    filterFullNameInput.value = "";
    filterGroupInput.value = "";
    filterDormitoryInput.value = "";
    filterMoveInDateInput.value = "";
    filterIsForeignSelect.value = "";
    filterNotesInput.value = "";
    filterRoomInput.value = "";
    filterIsuIdInput.value = "";

    loadStudents();
}


function initFilters() {
    applyFiltersButton.addEventListener("click", applyFilters);
    resetFiltersButton.addEventListener("click", resetFilters);

    const params = new URLSearchParams(window.location.search);

    filterFullNameInput.value = params.get("fullName") || "";
    filterGroupInput.value = params.get("group") || "";
    filterDormitoryInput.value = params.get("dormitory") || "";
    filterRoomInput.value = params.get("roomNumber") || "";
    filterIsuIdInput.value = params.get("isuId") || "";
    filterMoveInDateInput.value = params.get("moveInDate") || "";
    filterIsForeignSelect.value = params.get("isForeign") || "";
    filterNotesInput.value = params.get("notes") || "";
}


initFilters();
loadStudents(readFilters());