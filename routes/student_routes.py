import re
from datetime import datetime

from flask import Blueprint, jsonify, request

from repositories.student_repository import (
    get_student_by_id
)
from services.student_service import (
    create_student,
    update_student,
    delete_student,
    validate_student_data,
    filter_students
)

student_routes = Blueprint("student_routes", __name__)


@student_routes.get("/api/students")
def get_requests():
    group = request.args.get("group")
    dormitory = request.args.get("dormitory")
    is_foreign = request.args.get("isForeign")

    if group is not None:
        if not re.fullmatch(r"[A-Z][1-9][1-4][0-9]{2}", group):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Некорректный формат группы"
                }
            }), 400

    if dormitory is not None:
        try:
            dormitory = int(dormitory)
        except ValueError:
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Номер общежития должен быть числом"
                }
            }), 400

    if is_foreign is not None:
        if is_foreign.lower() == "true":
            is_foreign = True
        elif is_foreign.lower() == "false":
            is_foreign = False
        else:
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "isForeign должен быть true или false"
                }
            }), 400

    students = filter_students(
        group,
        dormitory,
        is_foreign
    )

    return jsonify(students), 200


@student_routes.get("/api/students/<int:student_id>")
def get_request(student_id):
    student = get_student_by_id(student_id)

    if student is None:
        return jsonify({
            "error": {
                "code": 404,
                "message": "Студент не найден"
            }
        }), 404

    return jsonify(student), 200


@student_routes.post("/api/students")
def create_request():
    if not request.is_json:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно содержать JSON"
            }
        }), 400

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Некорректный JSON"
            }
        }), 400

    if not isinstance(data, dict):
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно быть JSON-объектом"
            }
        }), 400

    allowed_fields = {
        "fullName",
        "group",
        "isuId",
        "dormitoryNumber",
        "roomNumber",
        "moveInDate",
        "isForeign",
        "notes"
    }

    unknown_fields = set(data.keys()) - allowed_fields

    if unknown_fields:
        return jsonify({
            "error": {
                "code": 422,
                "message": "Обнаружены недопустимые поля",
                "details": sorted(unknown_fields)
            }
        }), 422

    errors = validate_student_data(data)

    if errors:
        return jsonify({
            "error": {
                "code": 422,
                "message": "Ошибка валидации",
                "details": errors
            }
        }), 422

    try:
        student = create_student(data)

        return jsonify(student), 201

    except ValueError as error:
        return jsonify({
            "error": {
                "code": 409,
                "message": str(error)
            }
        }), 409


@student_routes.patch("/api/students/<int:student_id>")
def update_request(student_id):
    student = get_student_by_id(student_id)

    if student is None:
        return jsonify({
            "error": {
                "code": 404,
                "message": "Студент не найден"
            }
        }), 404

    if not request.is_json:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно содержать JSON"
            }
        }), 400

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Некорректный JSON"
            }
        }), 400

    if not isinstance(data, dict):
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно быть JSON-объектом"
            }
        }), 400

    allowed_fields = {
        "fullName",
        "group",
        "isuId",
        "dormitoryNumber",
        "roomNumber",
        "moveInDate",
        "isForeign",
        "notes"
    }

    unknown_fields = set(data.keys()) - allowed_fields

    if unknown_fields:
        return jsonify({
            "error": {
                "code": 422,
                "message": "Обнаружены недопустимые поля",
                "details": sorted(unknown_fields)
            }
        }), 422

    updated_data = student.copy()
    updated_data.update(data)

    errors = validate_student_data(updated_data)

    if errors:
        return jsonify({
            "error": {
                "code": 422,
                "message": "Ошибка валидации",
                "details": errors
            }
        }), 422

    try:
        updated_student = update_student(student_id, data)

        return jsonify(updated_student), 200

    except ValueError as error:
        return jsonify({
            "error": {
                "code": 409,
                "message": str(error)
            }
        }), 409


@student_routes.delete("/api/students/<int:student_id>")
def delete_request(student_id):
    deleted = delete_student(student_id)

    if not deleted:
        return jsonify({
            "error": {
                "code": 404,
                "message": "Студент не найден"
            }
        }), 404

    return "", 204


@student_routes.route("/api/students", methods=["QUERY"])
def query_requests():
    if not request.is_json:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно содержать JSON"
            }
        }), 400

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({
            "error": {
                "code": 400,
                "message": "Некорректный JSON"
            }
        }), 400

    if not isinstance(data, dict):
        return jsonify({
            "error": {
                "code": 400,
                "message": "Тело запроса должно быть JSON-объектом"
            }
        }), 400

    allowed_filters = {
        "fullName",
        "group",
        "dormitory",
        "roomNumber",
        "isuId",
        "moveInDate",
        "isForeign",
        "notes"
    }

    unknown_filters = set(data.keys()) - allowed_filters

    if unknown_filters:
        return jsonify({
            "error": {
                "code": 422,
                "message": "Обнаружены недопустимые параметры фильтрации",
                "details": sorted(unknown_filters)
            }
        }), 422

    full_name = data.get("fullName")
    group = data.get("group")
    dormitory = data.get("dormitory")
    move_in_date = data.get("moveInDate")
    is_foreign = data.get("isForeign")
    notes = data.get("notes")
    room_number = data.get("roomNumber")
    isu_id = data.get("isuId")

    if full_name is not None:
        if not isinstance(full_name, str) or not full_name.strip():
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "ФИО для поиска должно быть непустой строкой"
                }
            }), 400

        full_name = full_name.strip()

    if group is not None:
        if (
                not isinstance(group, str)
                or not re.fullmatch(r"[A-Z][1-9][1-4][0-9]{2}", group)
        ):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Некорректный формат группы"
                }
            }), 400

    if dormitory is not None:
        if (
                not isinstance(dormitory, int)
                or isinstance(dormitory, bool)
                or dormitory < 1
                or dormitory > 99
        ):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Номер общежития должен быть числом от 1 до 99"
                }
            }), 400

    if move_in_date is not None:
        if not isinstance(move_in_date, str):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Дата заселения должна быть строкой"
                }
            }), 400

        try:
            datetime.strptime(move_in_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Некорректный формат даты"
                }
            }), 400

    if is_foreign is not None:
        if not isinstance(is_foreign, bool):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "isForeign должен быть true или false"
                }
            }), 400

    if notes is not None:
        if not isinstance(notes, str) or not notes.strip():
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Текст для поиска по заметкам должен быть непустой строкой"
                }
            }), 400
        notes = notes.strip()

    if room_number is not None:
        if (
                not isinstance(room_number, int)
                or isinstance(room_number, bool)
                or room_number < 1
                or room_number > 9999
        ):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "Номер комнаты должен быть числом от 1 до 9999"
                }
            }), 400

    if isu_id is not None:
        if (
                not isinstance(isu_id, int)
                or isinstance(isu_id, bool)
                or isu_id < 100000
                or isu_id > 999999
        ):
            return jsonify({
                "error": {
                    "code": 400,
                    "message": "ИСУ ID должен быть шестизначным числом"
                }
            }), 400

    students = filter_students(
        group=group,
        dormitory=dormitory,
        room_number=room_number,
        isu_id=isu_id,
        is_foreign=is_foreign,
        full_name=full_name,
        move_in_date=move_in_date,
        notes=notes
    )

    return jsonify(students), 200
