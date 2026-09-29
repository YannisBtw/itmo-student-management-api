import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "students.json"


def get_all_students():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        students = json.load(file)

    return students


def get_student_by_id(student_id):
    students = get_all_students()

    for student in students:
        if student["id"] == student_id:
            return student

    return None


def get_student_by_isu_id(isu_id):
    students = get_all_students()

    for student in students:
        if student["isuId"] == isu_id:
            return student

    return None


def save_students(students):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(students, file, ensure_ascii=False, indent=4)
