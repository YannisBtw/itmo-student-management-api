from flask import Flask, jsonify, render_template

from routes.student_routes import student_routes

app = Flask(__name__)

app.json.ensure_ascii = False

app.register_blueprint(student_routes)


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "error": {
            "code": 500,
            "message": "Внутренняя ошибка сервера"
        }
    }), 500


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/student-form.html")
def student_form():
    return render_template("student-form.html")


@app.get("/student-details.html")
def student_details():
    return render_template("student-details.html")


if __name__ == "__main__":
    app.run(debug=True)
