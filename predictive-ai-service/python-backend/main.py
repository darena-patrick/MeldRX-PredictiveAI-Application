from fastapi import FastAPI, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import base64
import requests
from fastapi import Request

app = FastAPI()

class Attachment(BaseModel):
    contentType: str
    data: Optional[str] = None
    url: Optional[str] = None

    class Config:
        extra = Extra.allow

class Content(BaseModel):
    attachment: Attachment

    class Config:
        extra = Extra.allow

class DocumentReference(BaseModel):
    resourceType: str
    id: str
    type: dict
    date: Optional[str]
    content: List[Content]

    class Config:
        extra = Extra.allow

class DocumentPayload(BaseModel):
    documents: List[DocumentReference]

    class Config:
        extra = Extra.allow

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.post('/analyze-document')
async def analyze_documents(payload: DocumentPayload, request: Request):
    raw = await request.body()
    print("Incoming raw payload:", raw.decode())
    documents = payload.documents
    results = []
    for doc in documents:
        attachment = doc.content[0].attachment
        content_type = attachment.contentType
        data = None

        # Handle base64-encoded content
        if attachment.data:
            try:
                decoded_data = base64.b64decode(attachment.data).decode('utf-8')
                data = decoded_data
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Base64 decode error: {e}")
        # Handle external URLs (e.g., XML files)
        elif attachment.url:
            try:
                response = requests.get(attachment.url)
                response.raise_for_status()
                data = response.text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch from URL: {e}")
        else:
            continue

        # Route based on content type
        if "text/plain" in content_type:
            result = process_plain_text(data)
        elif "text/html" in content_type:
            result = process_html(data)
        elif "application/xml" in content_type:
            result = process_ccda_xml(data)
        elif "application/pdf" in content_type:
            result = process_pdf(data)
        elif "application/dicom" in content_type:
            result = process_dicom(data)
        else:
            result = {"error": "Unsupported content type"}

        results.append({
            "document_id": doc.id,
            "type": doc.type,
            "content_type": content_type,
            "analysis": result,
        })

    print(results)

    return {"results": results}

# Placeholder functions
def process_plain_text(text):
    return {"summary": text[:300]}

def process_html(html):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    return {"text": soup.get_text()[:300]}

def process_ccda_xml(xml):
    import xml.etree.ElementTree as ET
    try:
        tree = ET.fromstring(xml)
        return {"root_tag": tree.tag}
    except Exception as e:
        return {"error": f"XML parsing error: {e}"}

def process_pdf(pdf_bytes):
    return {"note": "PDF processing not implemented yet"}

def process_dicom(dicom_bytes):
    return {"note": "DICOM processing not implemented yet"}