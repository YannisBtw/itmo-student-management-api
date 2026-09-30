import re
from datetime import datetime, date

from repositories.student_repository import (
    get_all_students,
    get_student_by_isu_id,
    save_students
)


def create_student(data):
    existing_student = get_student_by_isu_id(data["isuId"])

    if existing_student is not None:
        raise ValueError("Студент с таким ИСУ ID уже существует")

    students = get_all_students()

    new_id = 1

    if students:
        new_id = max(student["id"] for student in students) + 1

    student = {
        "id": new_id,
        "fullName": data["fullName"],
        "group": data["group"],
        "isuId": data["isuId"],
        "dormitoryNumber": data["dormitoryNumber"],
        "roomNumber": data["roomNumber"],
        "moveInDate": data["moveInDate"],
        "isForeign": data["isForeign"],
        "notes": data.get("notes", "")
    }

    students.append(student)
    save_students(students)

    return student


def validate_student_data(data):
    errors = {}

    full_name = data.get("fullName")

    if not isinstance(full_name, str) or not full_name.strip():
        errors["fullName"] = "ФИО обязательно"
    else:
        name_parts = full_name.strip().split()

        if len(name_parts) < 2 or any(len(part) < 2 for part in name_parts):
            errors["fullName"] = (
                "ФИО должно содержать минимум 2 слова, "
                "каждое не короче 2 символов"
            )

    group = data.get("group")

    if not isinstance(group, str) or not re.fullmatch(
            r"[A-Z][1-9][1-4][0-9]{2}", group):
        errors["group"] = "Некорректный формат группы"

    isu_id = data.get("isuId")

    if (
            not isinstance(isu_id, int)
            or isinstance(isu_id, bool)
            or isu_id < 100000
            or isu_id > 999999
    ):
        errors["isuId"] = "ИСУ ID должен быть шестизначным числом"

    dormitory_number = data.get("dormitoryNumber")

    if (
            not isinstance(dormitory_number, int)
            or isinstance(dormitory_number, bool)
            or dormitory_number < 1
            or dormitory_number > 99
    ):
        errors["dormitoryNumber"] = (
            "Номер общежития должен быть числом от 1 до 99"
        )

    room_number = data.get("roomNumber")

    if (
            not isinstance(room_number, int)
            or isinstance(room_number, bool)
            or room_number < 1
            or room_number > 9999
    ):
        errors["roomNumber"] = (
            "Номер комнаты должен быть числом от 1 до 9999"
        )

    move_in_date = data.get("moveInDate")

    if not isinstance(move_in_date, str):
        errors["moveInDate"] = "Дата заселения обязательна"

    else:
        try:
            parsed_date = datetime.strptime(
                move_in_date,
                "%Y-%m-%d"
            ).date()

            if parsed_date < date(1990, 1, 1):
                errors["moveInDate"] = (
                    "Дата заселения не может быть раньше 01.01.1990"
                )

            elif parsed_date > date.today():
                errors["moveInDate"] = (
                    "Дата заселения не может быть позже текущей даты"
                )

        except ValueError:
            errors["moveInDate"] = "Некорректный формат даты"

    is_foreign = data.get("isForeign")

    if not isinstance(is_foreign, bool):
        errors["isForeign"] = (
            "Поле isForeign должно содержать true или false"
        )

    notes = data.get("notes", "")

    if not isinstance(notes, str):
        errors["notes"] = "Заметки должны быть строкой"

    return errors


def update_student(student_id, data):
    students = get_all_students()

    for student in students:
        if student["id"] == student_id:
            if "isuId" in data:
                existing_student = get_student_by_isu_id(data["isuId"])

                if (
                        existing_student is not None
                        and existing_student["id"] != student_id
                ):
                    raise ValueError(
                        "Студент с таким ИСУ ID уже существует"
                    )

            student.update(data)
            save_students(students)

            return student

    return None


def delete_student(student_id):
    students = get_all_students()

    for student in students:
        if student["id"] == student_id:
            students.remove(student)
            save_students(students)

            return True

    return False


def filter_students(
    group=None,
    dormitory=None,
    is_foreign=None,
    full_name=None,
    move_in_date=None,
    notes=None,
    room_number=None,
    isu_id=None
):
    students = get_all_students()

    if group is not None:
        students = [
            student
            for student in students
            if student["group"] == group
        ]

    if dormitory is not None:
        students = [
            student
            for student in students
            if student["dormitoryNumber"] == dormitory
        ]

    if room_number is not None:
        students = [
            student
            for student in students
            if student["roomNumber"] == room_number
        ]

    if isu_id is not None:
        students = [
            student
            for student in students
            if student["isuId"] == isu_id
        ]

    if is_foreign is not None:
        students = [
            student
            for student in students
            if student["isForeign"] == is_foreign
        ]

    if full_name is not None:
        students = [
            student
            for student in students
            if full_name.casefold() in student["fullName"].casefold()
        ]

    if move_in_date is not None:
        students = [
            student
            for student in students
            if student["moveInDate"] == move_in_date
        ]

    if notes is not None:
        students = [
            student
            for student in students
            if notes.casefold() in student.get("notes", "").casefold()
        ]

    return students