import json, os, tempfile, textwrap, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.respond(200, body={"status": "ok"}) if self.path == "/health" else self.respond(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/render-shell":
            return self.respond(404, {"error": "not found"})
        if not is_authorized(self):
            return self.respond(401, {"error": "Unauthorized"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            job_id = body.get("jobId") or str(uuid.uuid4())
            code = normalize_build123d_code(body["build123dCode"])
            out_dir = Path(os.getenv("OUTPUT_DIR", tempfile.gettempdir())) / "cad-worker" / job_id
            out_dir.mkdir(parents=True, exist_ok=True)
            import build123d
            ns = vars(build123d).copy()
            ns["description"] = body.get("description", "")
            exec(code, ns)
            shell = ns.get("shell") or ns["result"]
            from build123d import export_step, export_stl
            step_path = out_dir / "shell.step"
            stl_path = out_dir / "shell.stl"
            export_step(shell, step_path)
            export_stl(shell, stl_path)
            storage_path = body.get("storagePath") or f"cad/{job_id}/shell"
            storage = {
                "step": upload_to_supabase(step_path, f"{storage_path}.step", "model/step"),
                "stl": upload_to_supabase(stl_path, f"{storage_path}.stl", "model/stl"),
            }
            self.respond(200, {"jobId": job_id, "stepPath": str(step_path), "stlPath": str(stl_path), "storage": storage})
        except Exception as error:
            self.respond(400, create_error_response(error, locals().get("code")))

    def respond(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def upload_to_supabase(file_path, storage_path, content_type):
    url, key = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SECRET_KEY")
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "cad-artifacts")
    if not url or not key:
        return {"skipped": "missing SUPABASE_URL or SUPABASE_SECRET_KEY"}
    object_path = quote(f"{bucket}/{storage_path}", safe="/")
    request = Request(
        f"{url}/storage/v1/object/{object_path}",
        data=Path(file_path).read_bytes(),
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": content_type,
            "x-upsert": "true",
        },
    )
    with urlopen(request) as response:
        json.loads(response.read() or b"{}")
    return {"bucket": bucket, "path": storage_path}


def is_authorized(handler):
    token = os.getenv("CAD_WORKER_TOKEN", "").strip()
    authorization = handler.headers.get("Authorization", "").strip()
    return bool(token) and authorization == f"Bearer {token}"


def normalize_build123d_code(code):
    code = str(code).strip()
    if code.startswith("```"):
        lines = code.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        code = "\n".join(lines)
    return textwrap.dedent(code).strip()


def create_error_response(error, code=None):
    body = {"error": str(error)}
    if isinstance(error, SyntaxError) and code:
        lines = code.splitlines()
        line_number = error.lineno or 1
        start = max(0, line_number - 3)
        end = min(len(lines), line_number + 2)
        body["line"] = line_number
        body["source"] = "\n".join(
            f"{index + 1}: {lines[index]}" for index in range(start, end)
        )
    return body


ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "8080"))), Handler).serve_forever()
