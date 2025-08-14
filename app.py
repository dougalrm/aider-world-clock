from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/hello")
    def hello() -> str:
        return "hello world"

    @app.get("/add/<int:a>/<int:b>")
    def add(a: int, b: int) -> str:
        return str(a + b)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
