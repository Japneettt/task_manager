import re
from app.core.database import SessionLocal
from app.models.team import Team

DEFAULT_IMAGE = "https://source.unsplash.com/800x600?abstract,team"

HTML_TAG_RE = re.compile(r"<.*?>")


def clean_image_url(value: str | None) -> str:
    if not value:
        return DEFAULT_IMAGE

    cleaned = HTML_TAG_RE.sub("", value).strip()
    return cleaned or DEFAULT_IMAGE


def main() -> None:
    db = SessionLocal()
    try:
        teams = db.query(Team).all()
        updated = 0

        for team in teams:
            new_url = clean_image_url(team.image_url)
            if team.image_url != new_url:
                team.image_url = new_url
                updated += 1

        if updated > 0:
            db.commit()
            print(f"Updated {updated} team image_url rows.")
        else:
            print("No team image_url rows required updating.")

        print("Cleanup complete. If you want raw SQL instead, use:")
        print("  UPDATE team SET image_url = regexp_replace(image_url, '<.*?>', '', 'g') WHERE image_url LIKE '%<a href%';")
        print("  UPDATE team SET image_url = 'https://source.unsplash.com/800x600?abstract,team' WHERE image_url IS NULL;")
    finally:
        db.close()


if __name__ == "__main__":
    main()
