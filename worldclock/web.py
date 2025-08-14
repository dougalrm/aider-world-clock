from flask import Blueprint, render_template

bp = Blueprint("web", __name__)


@bp.get("/")
def home() -> str:
    return render_template("index.html")
