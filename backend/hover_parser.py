"""
Hover PDF Parser - Extracts measurements from Hover "Complete Measurements" PDF
"""
import re
import math
import pdfplumber
from typing import Optional
from pydantic import BaseModel


class HoverMeasurements(BaseModel):
    """Extracted measurements from Hover PDF"""
    # Property info
    property_address: Optional[str] = None
    property_id: Optional[str] = None
    customer_name: Optional[str] = None

    # Siding measurements (from SIDING WASTE TOTALS table)
    # Using "Openings < 33ft²" row which is most commonly used
    siding_squares_0_waste: Optional[float] = None
    siding_squares_10_waste: Optional[float] = None
    siding_squares_18_waste: Optional[float] = None

    # Facades
    facades_area_sqft: Optional[float] = None
    openings_sqft: Optional[float] = None

    # Corners
    inside_corners_count: Optional[int] = None
    inside_corners_length: Optional[float] = None
    outside_corners_count: Optional[int] = None
    outside_corners_length: Optional[float] = None

    # Trim lengths
    level_starter_length: Optional[float] = None
    sloped_starter_length: Optional[float] = None
    vertical_starter_length: Optional[float] = None

    # Soffit area (from Level Frieze + Sloped Frieze)
    soffit_total_sqft: Optional[float] = None

    # Fascia/Frieze lengths
    eaves_fascia_length: Optional[float] = None
    level_frieze_length: Optional[float] = None
    rakes_fascia_length: Optional[float] = None
    sloped_frieze_length: Optional[float] = None

    # Porch ceiling (from Frieze Board data in Soffit Summary)
    # Frieze Board = porch ceiling in Hover terminology
    porch_ceiling_sqft: Optional[float] = None
    porch_beam_lf: Optional[float] = None

    # Gutters (eaves = gutter length typically)
    gutter_total_length: Optional[float] = None


def _parse_length(length_str: str) -> Optional[float]:
    """Parse length string like '134' 1\"' to decimal feet"""
    if not length_str or length_str == '-':
        return None
    # Match patterns like "134' 1\"" or "103' 8\""
    match = re.search(r"(\d+)'?\s*(\d+)?\"?", length_str.replace("'", "'").replace('"', '"'))
    if match:
        feet = int(match.group(1))
        inches = int(match.group(2)) if match.group(2) else 0
        return round(feet + inches / 12, 1)
    return None


def _parse_sqft(sqft_str: str) -> Optional[float]:
    """Parse square footage string like '1703 ft²' to float"""
    if not sqft_str or sqft_str == '-':
        return None
    match = re.search(r'([\d,]+)\s*(?:ft²|sq)', sqft_str)
    if match:
        return float(match.group(1).replace(',', ''))
    return None


def _parse_squares(squares_str: str) -> Optional[float]:
    """Parse squares string like '24½' or '22¾' to float"""
    if not squares_str or squares_str == '-':
        return None
    # Remove any extra whitespace
    squares_str = squares_str.strip()

    # Handle fractions
    fraction_map = {'½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.33, '⅔': 0.67}

    # Try to extract the number
    match = re.search(r'(\d+)([½¼¾⅓⅔])?', squares_str)
    if match:
        whole = int(match.group(1))
        frac = fraction_map.get(match.group(2), 0) if match.group(2) else 0
        return whole + frac
    return None


def parse_hover_pdf(pdf_path: str) -> HoverMeasurements:
    """
    Parse a Hover Complete Measurements PDF and extract key values.

    Args:
        pdf_path: Path to the Hover PDF file

    Returns:
        HoverMeasurements object with extracted values
    """
    measurements = HoverMeasurements()

    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            text = page.extract_text() or ""
            full_text += text + "\n"

            # Also extract tables for structured data
            tables = page.extract_tables()
            for table in tables:
                _process_table(table, measurements, text)

        # Parse text for values not in tables
        _parse_text_values(full_text, measurements)

    return measurements


def _process_table(table: list, measurements: HoverMeasurements, page_text: str = ""):
    """Process a table extracted from the PDF"""
    if not table or len(table) < 2:
        return

    # Convert table to string for easier searching
    table_str = " ".join(" ".join(str(cell or "") for cell in row) for row in table).lower()

    # Check for Areas table (Facades, Openings)
    if 'facades' in table_str and 'ft²' in table_str:
        for row in table:
            if not row:
                continue
            row_text = str(row[0] or "").lower()
            if 'facades' in row_text:
                measurements.facades_area_sqft = _parse_sqft(str(row[1] or ""))
            elif 'openings' in row_text:
                measurements.openings_sqft = _parse_sqft(str(row[1] or ""))

    # Check for Corners table
    if 'inside' in table_str and 'outside' in table_str and 'qty' in table_str:
        for row in table:
            if not row:
                continue
            row_text = str(row[0] or "").lower()
            if 'inside' in row_text and 'qty' in row_text:
                # Try to find the count
                for cell in row[1:]:
                    cell_str = str(cell or "")
                    if cell_str.isdigit():
                        measurements.inside_corners_count = int(cell_str)
                        break
            elif 'outside' in row_text and 'qty' in row_text:
                for cell in row[1:]:
                    cell_str = str(cell or "")
                    if cell_str.isdigit():
                        measurements.outside_corners_count = int(cell_str)
                        break

    # Check for Roofline/Fascia table
    if 'eaves' in table_str or 'fascia' in table_str or 'frieze' in table_str:
        for row in table:
            if not row:
                continue
            row_text = str(row[0] or "").lower()
            if 'eaves' in row_text and 'fascia' in row_text:
                measurements.eaves_fascia_length = _parse_length(str(row[1] or ""))
                # Eaves fascia = gutter length
                measurements.gutter_total_length = measurements.eaves_fascia_length
            elif 'level' in row_text and 'frieze' in row_text:
                measurements.level_frieze_length = _parse_length(str(row[1] or ""))
                # Add soffit area from this row if present
                for cell in row:
                    sqft = _parse_sqft(str(cell or ""))
                    if sqft and sqft > 50:  # Likely soffit area
                        measurements.soffit_total_sqft = (measurements.soffit_total_sqft or 0) + sqft
            elif 'rakes' in row_text and 'fascia' in row_text:
                measurements.rakes_fascia_length = _parse_length(str(row[1] or ""))
            elif 'sloped' in row_text and 'frieze' in row_text:
                measurements.sloped_frieze_length = _parse_length(str(row[1] or ""))
                # Add soffit area from this row if present
                for cell in row:
                    sqft = _parse_sqft(str(cell or ""))
                    if sqft and sqft > 50:
                        measurements.soffit_total_sqft = (measurements.soffit_total_sqft or 0) + sqft

    # Check for Soffit Summary/Breakdown table - look for large depth entries (porch ceiling)
    # Soffit entries with depth > 48" are likely porch ceilings, not regular eave soffits
    # Regular eave soffits are typically 12-24" deep
    if 'soffit' in table_str:
        for row in table:
            if not row:
                continue
            row_text = ' '.join(str(cell or '') for cell in row).lower()
            # Look for depth values indicating porch ceiling (> 48")
            # Check each cell for large depth measurements
            for i, cell in enumerate(row):
                cell_str = str(cell or '').strip()
                # Look for inch measurements like "76\"" or "72\"" or values > 48
                depth_match = re.search(r'(\d+)"', cell_str)
                if depth_match:
                    depth_inches = int(depth_match.group(1))
                    if depth_inches > 48:  # Porch ceiling threshold
                        # Find the area value in this row (usually last cell with ft²)
                        for area_cell in reversed(row):
                            sqft = _parse_sqft(str(area_cell or ''))
                            if sqft and sqft > 0:
                                measurements.porch_ceiling_sqft = (measurements.porch_ceiling_sqft or 0) + sqft
                                break
                        break  # Only count once per row


def _parse_text_values(text: str, measurements: HoverMeasurements):
    """Parse values from the full text content"""

    # Find address with city/state/zip on page 2 header format: "319 Walden Station Drive, Macon, GA"
    # This is the cleaner format that appears on summary pages
    address_match = re.search(
        r'(\d+\s+[\w\s]+(?:Drive|Dr|Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Way|Circle|Cir|Court|Ct|Boulevard|Blvd),\s*[\w\s]+,\s*[A-Z]{2})',
        text, re.IGNORECASE
    )
    if address_match:
        measurements.property_address = address_match.group(1).strip()
    else:
        # Fallback: first line without "Complete Measurements"
        lines = text.strip().split('\n')
        for line in lines[:3]:
            line = line.strip()
            if re.search(r'^\d+\s+\w+.*(?:Drive|Dr|Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Way)', line, re.IGNORECASE):
                if 'Complete' not in line:
                    measurements.property_address = line
                    break

    # Customer name - look for all caps name before date
    name_match = re.search(r'MODEL ID:\s*\d+\s*\n([A-Z][A-Z\s]+)\n', text)
    if name_match:
        measurements.customer_name = name_match.group(1).strip().title()

    # Property ID
    id_match = re.search(r'PROPERTY\s*ID[:\s]*(\d+)', text, re.IGNORECASE)
    if id_match:
        measurements.property_id = id_match.group(1)

    # Siding squares from SIDING WASTE TOTALS section
    # Look for the "Openings < 33ft²" section which is the standard
    # Pattern: Zero Waste ... 20¾   +10% ... 22¾   +18% ... 24½
    squares_section = re.search(
        r'\+\s*Openings\s*<\s*33ft².*?Zero\s*Waste\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?).*?\+10%\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?).*?\+18%\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?)',
        text, re.DOTALL | re.IGNORECASE
    )
    if squares_section:
        measurements.siding_squares_0_waste = _parse_squares(squares_section.group(1))
        measurements.siding_squares_10_waste = _parse_squares(squares_section.group(2))
        measurements.siding_squares_18_waste = _parse_squares(squares_section.group(3))
    else:
        # Try simpler pattern - look for squares values
        # Format in text: "Zero Waste 2054 ft² 20¾"
        zero_match = re.search(r'Zero\s*Waste\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?)', text)
        ten_match = re.search(r'\+10%\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?)', text)
        eighteen_match = re.search(r'\+18%\s*[\d,]+\s*ft²\s*(\d+[½¼¾⅓⅔]?)', text)

        if zero_match:
            measurements.siding_squares_0_waste = _parse_squares(zero_match.group(1))
        if ten_match:
            measurements.siding_squares_10_waste = _parse_squares(ten_match.group(1))
        if eighteen_match:
            measurements.siding_squares_18_waste = _parse_squares(eighteen_match.group(1))

    # Inside corners count from text
    inside_match = re.search(r'Inside\s*Qty\s*(\d+)', text, re.IGNORECASE)
    if inside_match and not measurements.inside_corners_count:
        measurements.inside_corners_count = int(inside_match.group(1))

    # Outside corners count from text
    outside_match = re.search(r'Outside\s*Qty\s*(\d+)', text, re.IGNORECASE)
    if outside_match and not measurements.outside_corners_count:
        measurements.outside_corners_count = int(outside_match.group(1))

    # Porch ceiling from Soffit Breakdown - look for entries with large depth (> 48")
    # Pattern in text: "5 eave 76\" 13' 11\" 88 ft²" where 76" is depth
    # Entries with depth > 48" are likely porch ceilings
    soffit_breakdown_pattern = re.findall(
        r'\d+\s+(?:eave|rake)\s+(\d+)"\s+[\d\'\s"]+\s+(\d+)\s*ft²',
        text, re.IGNORECASE
    )
    if soffit_breakdown_pattern and not measurements.porch_ceiling_sqft:
        total_sqft = 0
        for depth_str, area_str in soffit_breakdown_pattern:
            try:
                depth = int(depth_str)
                area = int(area_str)
                if depth > 48:  # Porch ceiling threshold (> 4 feet deep)
                    total_sqft += area
            except ValueError:
                continue
        if total_sqft > 0:
            measurements.porch_ceiling_sqft = total_sqft

    # Calculate porch beam LF from porch ceiling area
    # Estimate perimeter assuming roughly square shape: perimeter ≈ 4 * sqrt(area)
    if measurements.porch_ceiling_sqft and measurements.porch_ceiling_sqft > 0:
        # Rough estimate: for a rectangular porch, perimeter = 4 * sqrt(area) for square
        # Most porches are rectangular, so use a factor of ~3.5 for typical proportions
        estimated_perimeter = 4 * math.sqrt(measurements.porch_ceiling_sqft)
        measurements.porch_beam_lf = round(estimated_perimeter, 1)


def _parse_float(value) -> Optional[float]:
    """Safely parse a float from various formats"""
    if value is None:
        return None
    try:
        # Remove commas and whitespace
        cleaned = str(value).replace(",", "").strip()
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _extract_sqft_from_row(row: list) -> Optional[float]:
    """Extract square footage value from a table row"""
    for cell in row:
        if cell is None:
            continue
        cell_str = str(cell)
        # Look for numbers that could be sq ft
        match = re.search(r'([\d,]+(?:\.\d+)?)', cell_str)
        if match:
            return _parse_float(match.group(1))
    return None
