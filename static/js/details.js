const studentDetails = document.getElementById("studentDetails");

const params = new URLSearchParams(window.location.search);
const studentId = Number(params.get("id"));


function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
}


function createDetailItem(label, value) {
    const item = document.createElement("div");
    item.classList.add("detail-item");

    const labelElement = document.createElement("span");
    labelElement.classList.add("detail-label");
    labelElement.textContent = label;

    const valueElement = document.createElement("span");
    valueElement.classList.add("detail-value");
    valueElement.textContent = value;

    item.appendChild(labelElement);
    item.appendChild(valueElement);

    return item;
}


function showStudentDetails(student) {
    studentDetails.textContent = "";

    studentDetails.appendChild(
        createDetailItem("ФИО", student.fullName)
    );

    studentDetails.appendChild(
        createDetailItem("Группа", student.group)
    );

    studentDetails.appendChild(
        createDetailItem("ИСУ ID", student.isuId)
    );

    studentDetails.appendChild(
        createDetailItem("Общежитие", student.dormitoryNumber)
    );

    studentDetails.appendChild(
        createDetailItem("Комната", student.roomNumber)
    );

    studentDetails.appendChild(
        createDetailItem(
            "Дата заселения",
            formatDate(student.moveInDate)
        )
    );

    studentDetails.appendChild(
        createDetailItem(
            "Иностранный студент",
            student.isForeign ? "Да" : "Нет"
        )
    );

    studentDetails.appendChild(
        createDetailItem(
            "Заметки",
            student.notes || "Нет заметок"
        )
    );
}


async function loadStudentDetails() {
    if (!studentId) {
        studentDetails.textContent = "Студент не найден";
        return;
    }

    try {
        const student = await getStudentById(studentId);

        if (!student) {
            studentDetails.textContent = "Студент не найден";
            return;
        }

        showStudentDetails(student);

    } catch (error) {
        console.error("Ошибка загрузки данных студента:", error);
        studentDetails.textContent = "Не удалось загрузить данные студента";
    }
}


loadStudentDetails();