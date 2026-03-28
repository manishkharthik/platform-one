from fastapi import APIRouter, UploadFile, File, HTTPException
from ai.icp_extractor import extract_icp_from_text
import io

router = APIRouter()


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from uploaded file (PDF or text)."""
    if filename.lower().endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(file_bytes))
            pages = [page.extract_text() or "" for page in reader.pages]
            return "\n\n".join(pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    else:
        # Treat as plain text (txt, md, etc.)
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Accept a product document, extract text, and return AI-extracted ICP fields."""
    allowed_types = {
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/octet-stream",
    }
    allowed_extensions = {".pdf", ".txt", ".md"}

    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Upload a PDF or text file.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    document_text = extract_text_from_file(file_bytes, filename)

    if not document_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document")

    icp = await extract_icp_from_text(document_text)
    return {"icp": icp}
