from pathlib import Path
from flask import Flask
from .web import bp as web_bp


def create_app() -> Flask:
    """
    Application factory for the World Clock app.
    Configures template and static directories and registers blueprints.
    """
    base_dir = Path(__file__).resolve().parent.parent
    templates_dir = str(base_dir / "templates")
    static_dir = str(base_dir / "static")

    app = Flask(
        __name__,
        template_folder=templates_dir,
        static_folder=static_dir,
    )

    # Blueprints
    app.register_blueprint(web_bp)

    return app
