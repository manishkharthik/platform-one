from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from ai.icp_extractor import extract_icp_from_text
import io

router = APIRouter()


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            return "\n\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")
    else:
        return file_bytes.decode("utf-8", errors="ignore")


@router.post("/documents/analyze")
async def analyze_documents(
    files: Optional[List[UploadFile]] = File(default=None),
    description: Optional[str] = Form(default=None),
):
    """Accept multiple product files + optional text description. Returns extracted ICP."""
    if not files and not description:
        raise HTTPException(status_code=400, detail="Provide at least one file or a description.")

    all_text = ""

    if files:
        for file in files:
            filename = file.filename or ""
            ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
            allowed = {".pdf", ".txt", ".md", ".docx", ".pptx"}
            if ext not in allowed:
                raise HTTPException(status_code=400, detail=f"Unsupported file: {filename}")
            content = await file.read()
            if len(content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail=f"{filename} exceeds 10MB limit")
            all_text += f"\n\n--- {filename} ---\n"
            all_text += extract_text_from_file(content, filename)

    if description:
        all_text += f"\n\n--- User Description ---\n{description}"

    if not all_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from provided content")

    icp = await extract_icp_from_text(all_text)
    return {"icp": icp}
