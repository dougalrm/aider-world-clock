from flask import Flask
from .web import bp as web_bp


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    # Blueprints
    app.register_blueprint(web_bp)

    return app
