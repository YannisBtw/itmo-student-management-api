const API_URL = "/api/requests";


async function getAllStudents(filters = {}) {
    const params = new URLSearchParams();

    if (filters.group) {
        params.set("group", filters.group);
    }

    if (filters.dormitory) {
        params.set("dormitory", filters.dormitory);
    }

    if (
        filters.isForeign !== undefined &&
        filters.isForeign !== ""
    ) {
        params.set("isForeign", filters.isForeign);
    }

    const query = params.toString();

    const url = query ? API_URL + "?" + query : API_URL;

    const response = await fetch(url);

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