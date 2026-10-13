import json
import os
import re
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlencode, urlparse

STORE_MAP = {
    "Steam": "steam",
    "Epic Games Store": "epic-games-store",
    "GOG": "gog",
    "GreenManGaming": "green-man-gaming",
    "Humble Store": "humble-store",
    "Fanatical": "fanatical",
}


def normalize_title(title):
    normalized = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
    normalized = re.sub(r"\b(edition)\b", "", normalized).strip()
    return normalized


def normalize_base_title(title):
    normalized = title.lower().strip()
    normalized = re.sub(r"\s+\([^)]*\)$", "", normalized).strip()
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized).strip()
    normalized = re.sub(
        r"\b(?:super )?(?:digital )?(?:deluxe|gold|ultimate|goty|originals)(?: edition)?$",
        "",
        normalized,
    ).strip()
    return re.sub(r"\s+", " ", normalized).strip()


def has_store(candidate, rawg_store):
    return any(
        item.get("store", {}).get("slug") == rawg_store
        for item in (candidate.get("stores", []) or [])
    )


def fetch_json(url):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read())


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        query = parse_qs(parsed_url.query)

        title = query.get("title", [None])[0]
        store = query.get("store", [None])[0]
        rawg_store = STORE_MAP.get(store)

        if not title:
            self.send_error(400, "title is required")
            return

        api_key = os.environ.get("RAWG_API_KEY")

        if not api_key:
            self.send_error(500, "RAWG_API_KEY is not configured")
            return

        search_url = (
            "https://api.rawg.io/api/games?" 
            + urlencode(
                {
                    "key": api_key,
                    "search": title,
                }
            )
        )

        rawg_data = fetch_json(search_url)

        results = rawg_data.get("results", [])
        normalized_title = normalize_title(title)
        base_title = normalize_base_title(title)

        base_match = None
        exact_match = None
        contains_match = None

        for result in results:
            result_name = result.get("name", "")
            result_title = normalize_title(result_name)
            result_base_title = normalize_base_title(result_name)

            store_match = rawg_store and has_store(result, rawg_store)

            if result_title == normalized_title:
                if store_match:
                    exact_match = result
                    break

                if exact_match is None:
                    exact_match = result

            if normalized_title in result_title and contains_match is None:
                contains_match = result

            if base_title == result_base_title and base_match is None:
                base_match = result

        match = exact_match or contains_match or base_match

        if not match:
            self.send_error(404, "No matching RAWG game found")
            return

        game_id = match.get("id")

        detail_url = (
            f"https://api.rawg.io/api/games/{game_id}?"
            + urlencode(
                {
                    "key": api_key,
                }
            )
        )

        detail_data = fetch_json(detail_url)

        developers = detail_data.get("developers", [])
        developer = developers[0].get("name") if developers else None

        genres = [genre.get("name") for genre in detail_data.get("genres", [])]

        response_data = {
            "description": detail_data.get("description_raw"),
            "developer": developer,
            "genres": genres,
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(json.dumps(response_data).encode("utf-8"))
