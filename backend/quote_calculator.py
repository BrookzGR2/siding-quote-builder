"""
Siding Quote Calculator - Pricing logic for siding estimates
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel
from hover_parser import HoverMeasurements


# ============================================================================
# PRICING CONFIGURATION (Verified Jan 12, 2026)
# ============================================================================

SIDING_PRODUCTS = {
    "quest_046": {"name": "Quest (.046)", "price": 590},
    "carvedwood_044": {"name": "Carvedwood 44 (.044)", "price": 525},
    "structure_insulated": {"name": "Structure/Prodigy Insulated (.046)", "price": 810},
    "board_batten": {"name": "Board & Batten", "price": 700},
    "shake": {"name": "Cedar Discovery Shake (Mastic)", "price": 870},
    "tando": {"name": "TandoStone Composite Stone", "price": 1500},
}

SOFFIT_FASCIA = {
    "soffit_over_16": 20,      # per LF for depths >16"
    "soffit_under_16": 19,     # per LF for depths ≤16"
    "fascia_frieze": 8,        # per LF
    "porch_beam": 16,          # per LF
    "porch_ceiling": 520,      # per ea
    "bird_box": 30,            # per ea
    "extra_bend_crown": 2,     # per LF
    "remove_soffit": 4,        # per LF
}

CORNERS = {
    "inside": 30,              # per ea
    "outside": 30,             # per ea
    "corner_caps": 90,         # per ea
}

LABOR = {
    "fullback_insulation": 120,  # per sq
    "fan_fold": 50,              # per sq
    "remove_dispose": 50,        # per sq
    "dormers_flashing": 50,      # per ea
    "window_buildup": 40,        # per ea (Prodigy)
}

WRAPS = {
    "window_wood": 125,
    "window_metal": 152,
    "door_wood": 125,
    "door_metal": 152,
    "transom_wood": 125,
    "transom_metal": 152,
    "garage_door": 175,
}

ACCESSORIES = {
    "vent": 140,
    "light_panel": 30,
    "receptacle": 19,
    "faucet_bib": 19,
    "dryer_vent": 37,
    "shutters": 200,  # per pair
}

GUTTERS = {
    "new_gutters": 16,        # per LF
    "take_down": 2,           # per LF
    "put_back_up": 2,         # per LF
}

OTHER = {
    "rotten_wood": 3,         # per LF
    "osb_sheet": 135,         # per 4x8 sheet
    "house_wrap": 140,        # per roll
    "fur_out": 250,           # per ea
    "cleanup_standard": 250,  # no dumpster
    "cleanup_full": 400,      # with dumpster
}


# ============================================================================
# DATA MODELS
# ============================================================================

class QuoteInput(BaseModel):
    """Input for quote calculation"""
    # Extracted from PDF
    measurements: Optional[HoverMeasurements] = None

    # Siding selection
    siding_product: str = "carvedwood_044"
    siding_profile: str = "D-4"
    siding_color: str = "Harbor Gray"
    waste_percent: int = 14  # 14, 16, or 18

    # G8 Trim selection
    g8_color: str = "Charcoal"

    # Override squares if needed
    siding_squares: Optional[float] = None

    # Corners (can override PDF values)
    inside_corners: int = 0
    outside_corners: int = 0

    # Soffit/Fascia
    soffit_lf: float = 0
    soffit_width_over_16: bool = False  # True = $20/LF, False = $19/LF
    fascia_frieze_lf: float = 0
    porch_beam_lf: float = 0
    porch_ceiling_count: int = 0
    bird_box_count: int = 0
    extra_bend_lf: float = 0
    remove_soffit_lf: float = 0

    # Labor options
    include_fan_fold: bool = True
    include_remove_dispose: bool = True
    include_fullback: bool = False
    dormers_count: int = 0
    window_buildup_count: int = 0

    # Wraps (toggle for wood vs metal)
    wraps_are_metal: bool = False
    window_wrap_count: int = 0
    door_wrap_count: int = 0
    transom_wrap_count: int = 0
    garage_door_wrap_count: int = 0

    # Accessories
    vent_count: int = 0
    light_panel_count: int = 0
    receptacle_count: int = 0
    faucet_count: int = 0
    dryer_vent_count: int = 0
    shutter_pairs: int = 0

    # Gutters
    new_gutter_lf: float = 0
    rehang_gutter_lf: float = 0

    # Other
    rotten_wood_lf: float = 0
    osb_sheets: int = 0
    house_wrap_rolls: int = 0
    fur_out_count: int = 0
    cleanup_type: str = "standard"  # "standard" or "full"
    extra_labor: float = 0


class LineItem(BaseModel):
    """A single line item in the quote"""
    category: str
    description: str
    quantity: float
    unit: str
    unit_price: float
    total: float


class QuoteResult(BaseModel):
    """Complete quote calculation result"""
    # Property info
    property_address: Optional[str] = None
    property_id: Optional[str] = None

    # Selections
    siding_product_name: str
    siding_profile: str
    siding_color: str
    g8_color: str

    # All line items (for internal view)
    line_items: list[LineItem] = []

    # Category subtotals (for customer view)
    siding_package_total: float = 0
    soffit_fascia_package_total: float = 0
    gutters_total: float = 0
    wraps_total: float = 0
    other_total: float = 0

    # Grand total
    grand_total: float = 0

    # Payment breakdown
    deposit_50: float = 0
    balance_50: float = 0


def calculate_quote(input_data: QuoteInput) -> QuoteResult:
    """
    Calculate a complete siding quote from input data.

    Args:
        input_data: QuoteInput with all measurements and selections

    Returns:
        QuoteResult with all line items and totals
    """
    result = QuoteResult(
        siding_product_name=SIDING_PRODUCTS.get(input_data.siding_product, {}).get("name", "Unknown"),
        siding_profile=input_data.siding_profile,
        siding_color=input_data.siding_color,
        g8_color=input_data.g8_color,
    )

    # Get property info from measurements if available
    if input_data.measurements:
        result.property_address = input_data.measurements.property_address
        result.property_id = input_data.measurements.property_id

    line_items = []

    # ========================================================================
    # SIDING PACKAGE
    # ========================================================================
    siding_total = 0

    # Get siding squares (from input or calculate from PDF)
    squares = input_data.siding_squares
    if squares is None and input_data.measurements:
        # Use waste-adjusted squares from PDF
        if input_data.waste_percent <= 10:
            squares = input_data.measurements.siding_squares_10_waste
        else:
            squares = input_data.measurements.siding_squares_18_waste
    squares = squares or 0

    # Siding material
    siding_price = SIDING_PRODUCTS.get(input_data.siding_product, {}).get("price", 525)
    if squares > 0:
        siding_line = LineItem(
            category="Siding",
            description=SIDING_PRODUCTS.get(input_data.siding_product, {}).get("name", "Siding"),
            quantity=squares,
            unit="sq",
            unit_price=siding_price,
            total=round(squares * siding_price, 2)
        )
        line_items.append(siding_line)
        siding_total += siding_line.total

    # Fan fold insulation
    if input_data.include_fan_fold and squares > 0:
        fan_fold_line = LineItem(
            category="Siding",
            description="Fan Fold Insulation",
            quantity=squares,
            unit="sq",
            unit_price=LABOR["fan_fold"],
            total=round(squares * LABOR["fan_fold"], 2)
        )
        line_items.append(fan_fold_line)
        siding_total += fan_fold_line.total

    # Remove and dispose
    if input_data.include_remove_dispose and squares > 0:
        remove_line = LineItem(
            category="Siding",
            description="Remove/Dispose Old Siding",
            quantity=squares,
            unit="sq",
            unit_price=LABOR["remove_dispose"],
            total=round(squares * LABOR["remove_dispose"], 2)
        )
        line_items.append(remove_line)
        siding_total += remove_line.total

    # Fullback insulation
    if input_data.include_fullback and squares > 0:
        fullback_line = LineItem(
            category="Siding",
            description="Fullback Insulation",
            quantity=squares,
            unit="sq",
            unit_price=LABOR["fullback_insulation"],
            total=round(squares * LABOR["fullback_insulation"], 2)
        )
        line_items.append(fullback_line)
        siding_total += fullback_line.total

    # Corners
    inside_count = input_data.inside_corners
    if inside_count == 0 and input_data.measurements:
        inside_count = input_data.measurements.inside_corners_count or 0

    outside_count = input_data.outside_corners
    if outside_count == 0 and input_data.measurements:
        outside_count = input_data.measurements.outside_corners_count or 0

    if inside_count > 0:
        inside_line = LineItem(
            category="Siding",
            description="Inside Corners",
            quantity=inside_count,
            unit="ea",
            unit_price=CORNERS["inside"],
            total=round(inside_count * CORNERS["inside"], 2)
        )
        line_items.append(inside_line)
        siding_total += inside_line.total

    if outside_count > 0:
        outside_line = LineItem(
            category="Siding",
            description="Outside Corners",
            quantity=outside_count,
            unit="ea",
            unit_price=CORNERS["outside"],
            total=round(outside_count * CORNERS["outside"], 2)
        )
        line_items.append(outside_line)
        siding_total += outside_line.total

    # Dormers
    if input_data.dormers_count > 0:
        dormers_line = LineItem(
            category="Siding",
            description="Dormers/Flashing",
            quantity=input_data.dormers_count,
            unit="ea",
            unit_price=LABOR["dormers_flashing"],
            total=round(input_data.dormers_count * LABOR["dormers_flashing"], 2)
        )
        line_items.append(dormers_line)
        siding_total += dormers_line.total

    result.siding_package_total = siding_total

    # ========================================================================
    # SOFFIT & FASCIA PACKAGE
    # ========================================================================
    soffit_total = 0

    # Soffit
    soffit_lf = input_data.soffit_lf
    if soffit_lf > 0:
        soffit_price = SOFFIT_FASCIA["soffit_over_16"] if input_data.soffit_width_over_16 else SOFFIT_FASCIA["soffit_under_16"]
        soffit_line = LineItem(
            category="Soffit/Fascia",
            description=f"Soffit ({'over' if input_data.soffit_width_over_16 else 'under'} 16\")",
            quantity=soffit_lf,
            unit="LF",
            unit_price=soffit_price,
            total=round(soffit_lf * soffit_price, 2)
        )
        line_items.append(soffit_line)
        soffit_total += soffit_line.total

    # Fascia/Frieze
    if input_data.fascia_frieze_lf > 0:
        fascia_line = LineItem(
            category="Soffit/Fascia",
            description="Fascia/Frieze",
            quantity=input_data.fascia_frieze_lf,
            unit="LF",
            unit_price=SOFFIT_FASCIA["fascia_frieze"],
            total=round(input_data.fascia_frieze_lf * SOFFIT_FASCIA["fascia_frieze"], 2)
        )
        line_items.append(fascia_line)
        soffit_total += fascia_line.total

    # Porch beam
    if input_data.porch_beam_lf > 0:
        beam_line = LineItem(
            category="Soffit/Fascia",
            description="Porch Beam",
            quantity=input_data.porch_beam_lf,
            unit="LF",
            unit_price=SOFFIT_FASCIA["porch_beam"],
            total=round(input_data.porch_beam_lf * SOFFIT_FASCIA["porch_beam"], 2)
        )
        line_items.append(beam_line)
        soffit_total += beam_line.total

    # Porch ceiling
    if input_data.porch_ceiling_count > 0:
        ceiling_line = LineItem(
            category="Soffit/Fascia",
            description="Porch Ceiling",
            quantity=input_data.porch_ceiling_count,
            unit="ea",
            unit_price=SOFFIT_FASCIA["porch_ceiling"],
            total=round(input_data.porch_ceiling_count * SOFFIT_FASCIA["porch_ceiling"], 2)
        )
        line_items.append(ceiling_line)
        soffit_total += ceiling_line.total

    # Bird boxes
    if input_data.bird_box_count > 0:
        bird_line = LineItem(
            category="Soffit/Fascia",
            description="Bird Box",
            quantity=input_data.bird_box_count,
            unit="ea",
            unit_price=SOFFIT_FASCIA["bird_box"],
            total=round(input_data.bird_box_count * SOFFIT_FASCIA["bird_box"], 2)
        )
        line_items.append(bird_line)
        soffit_total += bird_line.total

    # Extra bend/crown
    if input_data.extra_bend_lf > 0:
        bend_line = LineItem(
            category="Soffit/Fascia",
            description="Extra Bend/Crown",
            quantity=input_data.extra_bend_lf,
            unit="LF",
            unit_price=SOFFIT_FASCIA["extra_bend_crown"],
            total=round(input_data.extra_bend_lf * SOFFIT_FASCIA["extra_bend_crown"], 2)
        )
        line_items.append(bend_line)
        soffit_total += bend_line.total

    # Remove soffit
    if input_data.remove_soffit_lf > 0:
        remove_soffit_line = LineItem(
            category="Soffit/Fascia",
            description="Remove Soffit/Fascia",
            quantity=input_data.remove_soffit_lf,
            unit="LF",
            unit_price=SOFFIT_FASCIA["remove_soffit"],
            total=round(input_data.remove_soffit_lf * SOFFIT_FASCIA["remove_soffit"], 2)
        )
        line_items.append(remove_soffit_line)
        soffit_total += remove_soffit_line.total

    result.soffit_fascia_package_total = soffit_total

    # ========================================================================
    # GUTTERS
    # ========================================================================
    gutters_total = 0

    # New gutters
    if input_data.new_gutter_lf > 0:
        new_gutter_line = LineItem(
            category="Gutters",
            description="New Gutters",
            quantity=input_data.new_gutter_lf,
            unit="LF",
            unit_price=GUTTERS["new_gutters"],
            total=round(input_data.new_gutter_lf * GUTTERS["new_gutters"], 2)
        )
        line_items.append(new_gutter_line)
        gutters_total += new_gutter_line.total

    # Rehang gutters (take down + put back)
    if input_data.rehang_gutter_lf > 0:
        rehang_price = GUTTERS["take_down"] + GUTTERS["put_back_up"]
        rehang_line = LineItem(
            category="Gutters",
            description="Remove/Rehang Gutters",
            quantity=input_data.rehang_gutter_lf,
            unit="LF",
            unit_price=rehang_price,
            total=round(input_data.rehang_gutter_lf * rehang_price, 2)
        )
        line_items.append(rehang_line)
        gutters_total += rehang_line.total

    result.gutters_total = gutters_total

    # ========================================================================
    # WRAPS
    # ========================================================================
    wraps_total = 0
    wrap_suffix = "metal" if input_data.wraps_are_metal else "wood"

    if input_data.window_wrap_count > 0:
        window_price = WRAPS[f"window_{wrap_suffix}"]
        window_wrap_line = LineItem(
            category="Wraps",
            description=f"Window Wrap ({'Metal' if input_data.wraps_are_metal else 'Wood'})",
            quantity=input_data.window_wrap_count,
            unit="ea",
            unit_price=window_price,
            total=round(input_data.window_wrap_count * window_price, 2)
        )
        line_items.append(window_wrap_line)
        wraps_total += window_wrap_line.total

    if input_data.door_wrap_count > 0:
        door_price = WRAPS[f"door_{wrap_suffix}"]
        door_wrap_line = LineItem(
            category="Wraps",
            description=f"Door Wrap ({'Metal' if input_data.wraps_are_metal else 'Wood'})",
            quantity=input_data.door_wrap_count,
            unit="ea",
            unit_price=door_price,
            total=round(input_data.door_wrap_count * door_price, 2)
        )
        line_items.append(door_wrap_line)
        wraps_total += door_wrap_line.total

    if input_data.transom_wrap_count > 0:
        transom_price = WRAPS[f"transom_{wrap_suffix}"]
        transom_wrap_line = LineItem(
            category="Wraps",
            description=f"Transom Wrap ({'Metal' if input_data.wraps_are_metal else 'Wood'})",
            quantity=input_data.transom_wrap_count,
            unit="ea",
            unit_price=transom_price,
            total=round(input_data.transom_wrap_count * transom_price, 2)
        )
        line_items.append(transom_wrap_line)
        wraps_total += transom_wrap_line.total

    if input_data.garage_door_wrap_count > 0:
        garage_wrap_line = LineItem(
            category="Wraps",
            description="Garage Door Wrap",
            quantity=input_data.garage_door_wrap_count,
            unit="ea",
            unit_price=WRAPS["garage_door"],
            total=round(input_data.garage_door_wrap_count * WRAPS["garage_door"], 2)
        )
        line_items.append(garage_wrap_line)
        wraps_total += garage_wrap_line.total

    result.wraps_total = wraps_total

    # ========================================================================
    # OTHER (Accessories + Misc)
    # ========================================================================
    other_total = 0

    # Accessories
    if input_data.vent_count > 0:
        vent_line = LineItem(
            category="Accessories",
            description="Vent",
            quantity=input_data.vent_count,
            unit="ea",
            unit_price=ACCESSORIES["vent"],
            total=round(input_data.vent_count * ACCESSORIES["vent"], 2)
        )
        line_items.append(vent_line)
        other_total += vent_line.total

    if input_data.light_panel_count > 0:
        light_line = LineItem(
            category="Accessories",
            description="Light Panel",
            quantity=input_data.light_panel_count,
            unit="ea",
            unit_price=ACCESSORIES["light_panel"],
            total=round(input_data.light_panel_count * ACCESSORIES["light_panel"], 2)
        )
        line_items.append(light_line)
        other_total += light_line.total

    if input_data.receptacle_count > 0:
        receptacle_line = LineItem(
            category="Accessories",
            description="Receptacle",
            quantity=input_data.receptacle_count,
            unit="ea",
            unit_price=ACCESSORIES["receptacle"],
            total=round(input_data.receptacle_count * ACCESSORIES["receptacle"], 2)
        )
        line_items.append(receptacle_line)
        other_total += receptacle_line.total

    if input_data.faucet_count > 0:
        faucet_line = LineItem(
            category="Accessories",
            description="Faucet/Bib",
            quantity=input_data.faucet_count,
            unit="ea",
            unit_price=ACCESSORIES["faucet_bib"],
            total=round(input_data.faucet_count * ACCESSORIES["faucet_bib"], 2)
        )
        line_items.append(faucet_line)
        other_total += faucet_line.total

    if input_data.dryer_vent_count > 0:
        dryer_line = LineItem(
            category="Accessories",
            description="Dryer Vent",
            quantity=input_data.dryer_vent_count,
            unit="ea",
            unit_price=ACCESSORIES["dryer_vent"],
            total=round(input_data.dryer_vent_count * ACCESSORIES["dryer_vent"], 2)
        )
        line_items.append(dryer_line)
        other_total += dryer_line.total

    if input_data.shutter_pairs > 0:
        shutter_line = LineItem(
            category="Accessories",
            description="Shutters",
            quantity=input_data.shutter_pairs,
            unit="pair",
            unit_price=ACCESSORIES["shutters"],
            total=round(input_data.shutter_pairs * ACCESSORIES["shutters"], 2)
        )
        line_items.append(shutter_line)
        other_total += shutter_line.total

    # Misc
    if input_data.rotten_wood_lf > 0:
        rotten_line = LineItem(
            category="Other",
            description="Rotten Wood Repair",
            quantity=input_data.rotten_wood_lf,
            unit="LF",
            unit_price=OTHER["rotten_wood"],
            total=round(input_data.rotten_wood_lf * OTHER["rotten_wood"], 2)
        )
        line_items.append(rotten_line)
        other_total += rotten_line.total

    if input_data.osb_sheets > 0:
        osb_line = LineItem(
            category="Other",
            description="OSB Sheeting",
            quantity=input_data.osb_sheets,
            unit="sheet",
            unit_price=OTHER["osb_sheet"],
            total=round(input_data.osb_sheets * OTHER["osb_sheet"], 2)
        )
        line_items.append(osb_line)
        other_total += osb_line.total

    if input_data.house_wrap_rolls > 0:
        wrap_roll_line = LineItem(
            category="Other",
            description="House Wrap",
            quantity=input_data.house_wrap_rolls,
            unit="roll",
            unit_price=OTHER["house_wrap"],
            total=round(input_data.house_wrap_rolls * OTHER["house_wrap"], 2)
        )
        line_items.append(wrap_roll_line)
        other_total += wrap_roll_line.total

    if input_data.fur_out_count > 0:
        fur_line = LineItem(
            category="Other",
            description="Fur Out",
            quantity=input_data.fur_out_count,
            unit="ea",
            unit_price=OTHER["fur_out"],
            total=round(input_data.fur_out_count * OTHER["fur_out"], 2)
        )
        line_items.append(fur_line)
        other_total += fur_line.total

    # Cleanup
    cleanup_price = OTHER["cleanup_full"] if input_data.cleanup_type == "full" else OTHER["cleanup_standard"]
    cleanup_line = LineItem(
        category="Other",
        description=f"Cleanup ({'Full' if input_data.cleanup_type == 'full' else 'Standard'})",
        quantity=1,
        unit="ea",
        unit_price=cleanup_price,
        total=cleanup_price
    )
    line_items.append(cleanup_line)
    other_total += cleanup_line.total

    # Extra labor
    if input_data.extra_labor > 0:
        extra_line = LineItem(
            category="Other",
            description="Additional Labor/Fuel",
            quantity=1,
            unit="$",
            unit_price=input_data.extra_labor,
            total=input_data.extra_labor
        )
        line_items.append(extra_line)
        other_total += extra_line.total

    result.other_total = other_total

    # ========================================================================
    # TOTALS
    # ========================================================================
    result.line_items = line_items
    result.grand_total = round(
        result.siding_package_total +
        result.soffit_fascia_package_total +
        result.gutters_total +
        result.wraps_total +
        result.other_total,
        2
    )
    result.deposit_50 = round(result.grand_total / 2, 2)
    result.balance_50 = round(result.grand_total - result.deposit_50, 2)

    return result
