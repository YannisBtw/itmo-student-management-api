const studentForm = document.getElementById("studentForm");

const fullNameInput = document.getElementById("fullName");
const groupInput = document.getElementById("group");
const isuIdInput = document.getElementById("isuId");
const dormitoryNumberInput = document.getElementById("dormitoryNumber");
const roomNumberInput = document.getElementById("roomNumber");
const moveInDateInput = document.getElementById("moveInDate");
const isForeignInput = document.getElementById("isForeign");
const notesInput = document.getElementById("notes");


const params = new URLSearchParams(window.location.search);
const studentId = Number(params.get("id"));


const today = new Date();

const todayString =
    today.getFullYear() + "-"
    + String(today.getMonth() + 1).padStart(2, "0") + "-"
    + String(today.getDate()).padStart(2, "0");

moveInDateInput.max = todayString;


function validateFullName() {
    const fullName = fullNameInput.value.trim();
    const nameParts = fullName.split(/\s+/);

    if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
        fullNameInput.setCustomValidity(
            "ФИО должно содержать минимум 2 слова, каждое не короче 2 символов"
        );
    } else {
        fullNameInput.setCustomValidity("");
    }
}


function getStudentFromForm() {
    return {
        fullName: fullNameInput.value.trim(),
        group: groupInput.value.trim(),
        isuId: isuIdInput.valueAsNumber,
        dormitoryNumber: dormitoryNumberInput.valueAsNumber,
        roomNumber: roomNumberInput.valueAsNumber,
        moveInDate: moveInDateInput.value,
        isForeign: isForeignInput.checked,
        notes: notesInput.value.trim()
    };
}


async function loadStudentForEditing() {
    if (!studentId) {
        return;
    }

    try {
        const student = await getStudentById(studentId);

        if (!student) {
            alert("Студент не найден");
            window.location.href = "/";
            return;
        }

        fullNameInput.value = student.fullName;
        groupInput.value = student.group;
        isuIdInput.value = student.isuId;
        dormitoryNumberInput.value = student.dormitoryNumber;
        roomNumberInput.value = student.roomNumber;
        moveInDateInput.value = student.moveInDate;
        isForeignInput.checked = student.isForeign;
        notesInput.value = student.notes;

    } catch (error) {
        console.error("Ошибка загрузки студента:", error);
    }
}


fullNameInput.addEventListener("input", validateFullName);

isuIdInput.addEventListener("input", function () {
    isuIdInput.setCustomValidity("");
});


studentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    validateFullName();

    if (!studentForm.checkValidity()) {
        studentForm.reportValidity();
        return;
    }

    const student = getStudentFromForm();

    try {
        if (studentId) {
            student.id = studentId;
            await updateStudent(student);
        } else {
            await addStudent(student);
        }

        window.location.href = "/";

    } catch (error) {
        if (error.status === 409) {
            isuIdInput.setCustomValidity(
                "Студент с таким ИСУ ID уже существует"
            );

            isuIdInput.reportValidity();
            return;
        }

        console.error("Ошибка сохранения студента:", error);
    }
});


loadStudentForEditing();