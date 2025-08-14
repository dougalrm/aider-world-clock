from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/hello")
    def hello() -> str:
        return "hello world"

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
