const API_URL = "/api/students";


async function getAllStudents(filters = {}) {
    const hasFilters = Object.keys(filters).length > 0;

    const options = hasFilters
        ? {
            method: "QUERY",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filters)
        }
        : {};

    const response = await fetch(API_URL, options);

    if (!response.ok) {
        throw new Error(
            "Ошибка загрузки студентов: " + response.status
        );
    }

    return response.json();
}


async function getStudentById(id) {
    const response = await fetch(API_URL + "/" + id);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            "Ошибка загрузки студента: " + response.status
        );
    }

    return response.json();
}


async function addStudent(student) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    });

if (!response.ok) {
    const errorData = await response.json();

    const error = new Error(
        errorData.error?.message || "Ошибка добавления студента"
    );

    error.status = response.status;

    throw error;
}

    return response.json();
}


async function updateStudent(student) {
    const studentId = student.id;

    const data = {
        fullName: student.fullName,
        group: student.group,
        isuId: student.isuId,
        dormitoryNumber: student.dormitoryNumber,
        roomNumber: student.roomNumber,
        moveInDate: student.moveInDate,
        isForeign: student.isForeign,
        notes: student.notes
    };

    const response = await fetch(
        API_URL + "/" + studentId,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

if (!response.ok) {
    const errorData = await response.json();

    const error = new Error(
        errorData.error?.message || "Ошибка обновления студента"
    );

    error.status = response.status;

    throw error;
}

    return response.json();
}


async function deleteStudent(id) {
    const response = await fetch(
        API_URL + "/" + id,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Ошибка удаления студента: " + response.status
        );
    }
}