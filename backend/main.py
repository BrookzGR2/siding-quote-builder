"""
Siding Quote Builder - FastAPI Backend
"""
import os
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from hover_parser import parse_hover_pdf, HoverMeasurements
from quote_calculator import calculate_quote, QuoteInput, QuoteResult, SIDING_PRODUCTS

app = FastAPI(
    title="Siding Quote Builder API",
    description="API for parsing Hover PDFs and calculating siding quotes",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "siding-quote-api"}


@app.get("/api/products")
async def get_products():
    """Get available siding products and their prices"""
    return {
        "products": SIDING_PRODUCTS,
        "profiles": ["D-4", "D-5", "D-4.5 DL", "D-6", "S-7", "S-8", "T-3", "7\" B&B"],
        "waste_options": [14, 16, 18],
    }


@app.post("/api/parse-pdf", response_model=HoverMeasurements)
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse a Hover PDF and extract measurements.

    Upload a Hover "Complete Measurements" PDF file and receive
    extracted measurements for use in quote calculation.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse the PDF
        measurements = parse_hover_pdf(tmp_path)

        return measurements

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

    finally:
        # Clean up temp file
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass


@app.post("/api/calculate", response_model=QuoteResult)
async def calculate(input_data: QuoteInput):
    """
    Calculate a siding quote from input data.

    Provide measurements (from PDF or manual entry) along with
    product selections to receive a complete quote breakdown.
    """
    try:
        result = calculate_quote(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating quote: {str(e)}")


class QuickQuoteRequest(BaseModel):
    """Request for quick quote with just PDF and basic selections"""
    siding_product: str = "carvedwood_044"
    siding_profile: str = "D-4"
    siding_color: str = "Harbor Gray"
    g8_color: str = "Charcoal"
    waste_percent: int = 14
    include_fan_fold: bool = True
    include_remove_dispose: bool = True
    cleanup_type: str = "standard"


@app.post("/api/quick-quote")
async def quick_quote(
    file: UploadFile = File(...),
    siding_product: str = "carvedwood_044",
    waste_percent: int = 14,
):
    """
    Upload PDF and get an instant quote with defaults.

    This is a simplified endpoint that parses the PDF and
    calculates a basic quote in one step.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        # Save and parse PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        measurements = parse_hover_pdf(tmp_path)

        # Build quote input
        quote_input = QuoteInput(
            measurements=measurements,
            siding_product=siding_product,
            waste_percent=waste_percent,
            include_fan_fold=True,
            include_remove_dispose=True,
        )

        # Calculate
        result = calculate_quote(quote_input)

        return {
            "measurements": measurements,
            "quote": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    finally:
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
