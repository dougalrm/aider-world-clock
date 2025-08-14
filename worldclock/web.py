"""Web routes for the World Clock application."""
from flask import Blueprint, render_template

bp = Blueprint("web", __name__)


@bp.get("/")
def home() -> str:
    """Render the home page."""
    return render_template("index.html")
