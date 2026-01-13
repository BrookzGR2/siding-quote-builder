import React, { useState, useCallback } from 'react';
import {
  Upload, FileText, ChevronDown, Check, X, Building2,
  Calculator, Palette, Eye, EyeOff, Download, Phone, Copy, RotateCcw, ExternalLink
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { InternalQuotePDF, CustomerQuotePDF } from './QuotePDF';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const API_BASE = process.env.REACT_APP_API_URL || '';

const MASTIC_COLORS = {
  neutrals: [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Almond', hex: '#EFDECD' },
    { name: 'Ivory', hex: '#FFFFF0' },
    { name: 'Sandstone', hex: '#786D5F' },
    { name: 'Natural Linen', hex: '#E0D8C8' },
    { name: 'Pebblestone Clay', hex: '#B8A590' },
    { name: 'Wicker', hex: '#C4A77D' },
    { name: 'Desert Sand', hex: '#D2B48C' },
  ],
  grays: [
    { name: 'Pewter', hex: '#8B8D8E' },
    { name: 'Harbor Gray', hex: '#6B7280' },
    { name: 'Deep Granite', hex: '#4B5563' },
    { name: 'Charcoal Smoke', hex: '#374151' },
    { name: 'Sterling', hex: '#9CA3AF' },
    { name: 'Graphite', hex: '#1F2937' },
  ],
  blues: [
    { name: 'Newport Blue', hex: '#264653' },
    { name: 'Coastal Blue', hex: '#457B9D' },
    { name: 'Regatta', hex: '#1D3557' },
    { name: 'Bayou', hex: '#2C5F7C' },
    { name: 'Pacific Blue', hex: '#118AB2' },
  ],
  greens: [
    { name: 'Cypress', hex: '#4A5D4C' },
    { name: 'Juniper', hex: '#3D5A45' },
    { name: 'Everest', hex: '#2D4A3E' },
    { name: 'Sage', hex: '#87A96B' },
    { name: 'Forest', hex: '#228B22' },
  ],
  browns: [
    { name: 'Russet', hex: '#80461B' },
    { name: 'Autumn Red', hex: '#8B4513' },
    { name: 'Bordeaux', hex: '#6B2D5B' },
    { name: 'Terra Cotta', hex: '#E2725B' },
    { name: 'Teak', hex: '#B38B6D' },
    { name: 'Montana Suede', hex: '#9B7653' },
    { name: 'Sable', hex: '#8B6914' },
    { name: 'Chestnut', hex: '#954535' },
    { name: 'Timber', hex: '#5D4E37' },
    { name: 'Maple', hex: '#C04000' },
    { name: 'Walnut', hex: '#5C4033' },
  ],
};

const G8_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Almond', hex: '#EFDECD' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Clay', hex: '#B8A590' },
  { name: 'Pewter', hex: '#8B8D8E' },
  { name: 'Musket Brown', hex: '#5C4033' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Royal Brown', hex: '#523A28' },
  { name: 'Charcoal', hex: '#374151' },
];

const SIDING_PRODUCTS = {
  quest_046: { name: 'Quest (.046)', price: 590 },
  carvedwood_044: { name: 'Carvedwood 44 (.044)', price: 525 },
  structure_insulated: { name: 'Structure/Prodigy Insulated (.046)', price: 810 },
  board_batten: { name: 'Board & Batten', price: 700 },
  shake: { name: 'Cedar Discovery Shake', price: 870 },
  tando: { name: 'TandoStone Composite', price: 1500 },
};

const PROFILES = ['D-4', 'D-5', 'D-4.5 DL', 'D-6', 'S-7', 'S-8', 'T-3', '7" B&B'];

const PRICING = {
  // Soffit & Fascia
  soffit_over_16: 20,
  soffit_under_16: 19,
  fascia: 8,              // per LF (was fascia_frieze)
  frieze: 6,              // per LF - NEW (separate from fascia)
  porch_beam: 16,
  soldier_row: 9,         // per LF - NEW
  porch_ceiling: 520,
  bird_box: 30,
  extra_bend: 2,
  remove_soffit: 4,
  // Siding
  inside_corner: 30,
  outside_corner: 30,
  fan_fold: 50,
  remove_dispose: 50,
  fullback: 120,
  // Wraps
  window_wrap_wood: 125,
  window_wrap_metal: 152,
  door_wrap: 150,         // FLAT RATE (was $125/$152 split)
  transom_wrap_wood: 125,
  transom_wrap_metal: 152,
  garage_single: 175,     // renamed from garage_wrap
  garage_double: 250,     // NEW
  // Accessories
  vent: 140,              // gable vents
  cover_utilities: 140,   // NEW - separate from vents
  light_panel: 30,
  receptacle: 19,
  faucet: 19,
  dryer_vent: 37,
  shutters: 250,          // FIXED: was 200
  // Columns - NEW
  columns_8ft: 350,
  columns_10ft: 400,
  // Gutters
  new_gutters: 16,
  gutter_cap: 8,          // NEW
  metal_screen: 3.5,      // NEW
  remove_gutters: 2,
  rehang_gutters: 2,
  // Other
  rotten_wood: 3,
  osb_sheet: 135,
  fur_out: 250,
  house_wrap: 0,          // Track qty only, no charge
  cleanup: 250,
  trailer: 150,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function SidingQuoteBuilder() {
  // View mode
  const [viewMode, setViewMode] = useState('internal'); // 'internal' or 'customer'

  // PDF upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);

  // Property info
  const [propertyAddress, setPropertyAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [hoverId, setHoverId] = useState('');

  // Siding selections
  const [sidingProduct, setSidingProduct] = useState('carvedwood_044');
  const [sidingProfile, setSidingProfile] = useState('D-4');
  const [sidingColor, setSidingColor] = useState('Harbor Gray');
  const [g8Color, setG8Color] = useState('Charcoal');

  // Color picker state
  const [showSidingColors, setShowSidingColors] = useState(false);
  const [showG8Colors, setShowG8Colors] = useState(false);
  const [showCornerColors, setShowCornerColors] = useState(false);

  // Corner color (often different from siding - e.g., white corners with colored siding)
  const [cornerColor, setCornerColor] = useState('White');
  const [cornerSameAsSiding, setCornerSameAsSiding] = useState(true);

  // Measurements from PDF (editable)
  const [sidingSquares, setSidingSquares] = useState(0);
  const [adjustedSquares, setAdjustedSquares] = useState(0); // What we actually order/charge
  const [insideCorners, setInsideCorners] = useState(0);
  const [outsideCorners, setOutsideCorners] = useState(0);

  // Labor options
  const [includeFanFold, setIncludeFanFold] = useState(true);
  const [includeRemoveDispose, setIncludeRemoveDispose] = useState(false);  // Only for existing vinyl siding
  const [includeFullback, setIncludeFullback] = useState(false);

  // Soffit/Fascia
  const [soffitLf, setSoffitLf] = useState(0);
  const [soffitWidthOver16, setSoffitWidthOver16] = useState(false);
  const [fasciaLf, setFasciaLf] = useState(0);
  const [friezeLf, setFriezeLf] = useState(0);           // NEW - separate from fascia
  const [porchBeamLf, setPorchBeamLf] = useState(0);
  const [soldierRowLf, setSoldierRowLf] = useState(0);   // NEW
  const [porchCeilingCount, setPorchCeilingCount] = useState(0);
  const [birdBoxCount, setBirdBoxCount] = useState(0);
  const [extraBendLf, setExtraBendLf] = useState(0);
  const [removeSoffitLf, setRemoveSoffitLf] = useState(0);

  // Wraps
  const [wrapsAreMetal, setWrapsAreMetal] = useState(false);  // For windows/transoms only
  const [windowWrapCount, setWindowWrapCount] = useState(0);
  const [doorWrapCount, setDoorWrapCount] = useState(0);      // $150 flat (no metal toggle)
  const [transomWrapCount, setTransomWrapCount] = useState(0);
  const [garageSingleCount, setGarageSingleCount] = useState(0);  // renamed from garageWrapCount
  const [garageDoubleCount, setGarageDoubleCount] = useState(0);  // NEW

  // Accessories
  const [ventCount, setVentCount] = useState(0);
  const [coverUtilitiesCount, setCoverUtilitiesCount] = useState(0);  // NEW - separate from vents
  const [lightPanelCount, setLightPanelCount] = useState(0);
  const [receptacleCount, setReceptacleCount] = useState(0);
  const [faucetCount, setFaucetCount] = useState(0);
  const [dryerVentCount, setDryerVentCount] = useState(0);
  const [shutterPairs, setShutterPairs] = useState(0);
  const [columns8ftCount, setColumns8ftCount] = useState(0);   // NEW
  const [columns10ftCount, setColumns10ftCount] = useState(0); // NEW

  // Gutters
  const [newGutterLf, setNewGutterLf] = useState(0);
  const [rehangGutterLf, setRehangGutterLf] = useState(0);
  const [gutterCapLf, setGutterCapLf] = useState(0);     // NEW
  const [metalScreenLf, setMetalScreenLf] = useState(0); // NEW

  // Other
  const [rottenWoodLf, setRottenWoodLf] = useState(0);
  const [osbSheets, setOsbSheets] = useState(0);
  const [furOutCount, setFurOutCount] = useState(0);
  const [houseWrapRolls, setHouseWrapRolls] = useState(0);
  const [trailerNeeded, setTrailerNeeded] = useState(false);
  const [extraLabor, setExtraLabor] = useState(0);

  // Payment discounts
  const [payWithCheck, setPayWithCheck] = useState(false);
  const [isMilitary, setIsMilitary] = useState(false);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const sidingPrice = SIDING_PRODUCTS[sidingProduct]?.price || 525;

    // Use the manually-set adjusted squares (already includes waste)

    // === SIDING PACKAGE ===
    // Includes: siding, corners, wraps, accessories, cleanup
    let sidingPackageTotal = adjustedSquares * sidingPrice;
    if (includeFanFold) sidingPackageTotal += adjustedSquares * PRICING.fan_fold;
    if (includeRemoveDispose) sidingPackageTotal += adjustedSquares * PRICING.remove_dispose;
    if (includeFullback) sidingPackageTotal += adjustedSquares * PRICING.fullback;
    sidingPackageTotal += insideCorners * PRICING.inside_corner;
    sidingPackageTotal += outsideCorners * PRICING.outside_corner;

    // Add wraps to siding package
    const windowWrapPrice = wrapsAreMetal ? PRICING.window_wrap_metal : PRICING.window_wrap_wood;
    const transomPrice = wrapsAreMetal ? PRICING.transom_wrap_metal : PRICING.transom_wrap_wood;
    sidingPackageTotal += windowWrapCount * windowWrapPrice;
    sidingPackageTotal += doorWrapCount * PRICING.door_wrap;  // $150 flat rate
    sidingPackageTotal += transomWrapCount * transomPrice;
    sidingPackageTotal += garageSingleCount * PRICING.garage_single;
    sidingPackageTotal += garageDoubleCount * PRICING.garage_double;

    // Add accessories/misc to siding package
    sidingPackageTotal += ventCount * PRICING.vent;
    sidingPackageTotal += coverUtilitiesCount * PRICING.cover_utilities;
    sidingPackageTotal += lightPanelCount * PRICING.light_panel;
    sidingPackageTotal += receptacleCount * PRICING.receptacle;
    sidingPackageTotal += faucetCount * PRICING.faucet;
    sidingPackageTotal += dryerVentCount * PRICING.dryer_vent;
    sidingPackageTotal += shutterPairs * PRICING.shutters;
    sidingPackageTotal += columns8ftCount * PRICING.columns_8ft;
    sidingPackageTotal += columns10ftCount * PRICING.columns_10ft;
    sidingPackageTotal += rottenWoodLf * PRICING.rotten_wood;
    sidingPackageTotal += osbSheets * PRICING.osb_sheet;
    sidingPackageTotal += furOutCount * PRICING.fur_out;
    sidingPackageTotal += houseWrapRolls * PRICING.house_wrap;
    // Only add cleanup if there's actual work
    const hasWork = adjustedSquares > 0 || soffitLf > 0 || fasciaLf > 0;
    if (hasWork) {
      sidingPackageTotal += PRICING.cleanup;
      if (trailerNeeded) sidingPackageTotal += PRICING.trailer;
    }
    sidingPackageTotal += extraLabor;

    // === SOFFIT & FASCIA PACKAGE ===
    // Includes: soffit, fascia, frieze, porch, bird boxes, gutters
    const soffitPrice = soffitWidthOver16 ? PRICING.soffit_over_16 : PRICING.soffit_under_16;
    let soffitFasciaPackageTotal = soffitLf * soffitPrice;
    soffitFasciaPackageTotal += fasciaLf * PRICING.fascia;
    soffitFasciaPackageTotal += friezeLf * PRICING.frieze;
    soffitFasciaPackageTotal += porchBeamLf * PRICING.porch_beam;
    soffitFasciaPackageTotal += soldierRowLf * PRICING.soldier_row;
    soffitFasciaPackageTotal += porchCeilingCount * PRICING.porch_ceiling;
    soffitFasciaPackageTotal += birdBoxCount * PRICING.bird_box;
    soffitFasciaPackageTotal += extraBendLf * PRICING.extra_bend;
    soffitFasciaPackageTotal += removeSoffitLf * PRICING.remove_soffit;

    // Add gutters to soffit/fascia package
    soffitFasciaPackageTotal += newGutterLf * PRICING.new_gutters;
    soffitFasciaPackageTotal += gutterCapLf * PRICING.gutter_cap;
    soffitFasciaPackageTotal += metalScreenLf * PRICING.metal_screen;
    // Rehang = $2/LF remove + $2/LF rehang = $4/LF total
    soffitFasciaPackageTotal += rehangGutterLf * PRICING.remove_gutters;
    soffitFasciaPackageTotal += rehangGutterLf * PRICING.rehang_gutters;

    const grandTotal = sidingPackageTotal + soffitFasciaPackageTotal;

    // Keep legacy totals for internal view compatibility
    const sidingTotal = adjustedSquares * sidingPrice +
      (includeFanFold ? adjustedSquares * PRICING.fan_fold : 0) +
      (includeRemoveDispose ? adjustedSquares * PRICING.remove_dispose : 0) +
      (includeFullback ? adjustedSquares * PRICING.fullback : 0) +
      insideCorners * PRICING.inside_corner +
      outsideCorners * PRICING.outside_corner;

    const soffitTotal = soffitLf * soffitPrice +
      fasciaLf * PRICING.fascia +
      friezeLf * PRICING.frieze +
      porchBeamLf * PRICING.porch_beam +
      soldierRowLf * PRICING.soldier_row +
      porchCeilingCount * PRICING.porch_ceiling +
      birdBoxCount * PRICING.bird_box +
      extraBendLf * PRICING.extra_bend +
      removeSoffitLf * PRICING.remove_soffit;

    const wrapsTotal = windowWrapCount * windowWrapPrice +
      doorWrapCount * PRICING.door_wrap +
      transomWrapCount * transomPrice +
      garageSingleCount * PRICING.garage_single +
      garageDoubleCount * PRICING.garage_double;

    const guttersTotal = newGutterLf * PRICING.new_gutters +
      gutterCapLf * PRICING.gutter_cap +
      metalScreenLf * PRICING.metal_screen +
      rehangGutterLf * PRICING.remove_gutters +
      rehangGutterLf * PRICING.rehang_gutters;

    const otherTotal = ventCount * PRICING.vent +
      coverUtilitiesCount * PRICING.cover_utilities +
      lightPanelCount * PRICING.light_panel +
      receptacleCount * PRICING.receptacle +
      faucetCount * PRICING.faucet +
      dryerVentCount * PRICING.dryer_vent +
      shutterPairs * PRICING.shutters +
      columns8ftCount * PRICING.columns_8ft +
      columns10ftCount * PRICING.columns_10ft +
      rottenWoodLf * PRICING.rotten_wood +
      osbSheets * PRICING.osb_sheet +
      furOutCount * PRICING.fur_out +
      houseWrapRolls * PRICING.house_wrap +
      (hasWork ? PRICING.cleanup : 0) +
      (hasWork && trailerNeeded ? PRICING.trailer : 0) +
      extraLabor;

    return {
      // New consolidated packages for customer view
      sidingPackageTotal,
      soffitFasciaPackageTotal,
      // Legacy totals for internal view
      sidingTotal,
      soffitTotal,
      wrapsTotal,
      guttersTotal,
      otherTotal,
      grandTotal,
      deposit: Math.ceil(grandTotal / 2),
      balance: Math.floor(grandTotal / 2),
    };
  }, [
    sidingProduct, adjustedSquares, includeFanFold, includeRemoveDispose, includeFullback,
    insideCorners, outsideCorners, soffitLf, soffitWidthOver16, fasciaLf, friezeLf, porchBeamLf,
    soldierRowLf, porchCeilingCount, birdBoxCount, extraBendLf, removeSoffitLf, wrapsAreMetal,
    windowWrapCount, doorWrapCount, transomWrapCount, garageSingleCount, garageDoubleCount,
    newGutterLf, gutterCapLf, metalScreenLf, rehangGutterLf, ventCount, coverUtilitiesCount,
    lightPanelCount, receptacleCount, faucetCount, dryerVentCount, shutterPairs,
    columns8ftCount, columns10ftCount, rottenWoodLf, osbSheets, furOutCount, houseWrapRolls,
    trailerNeeded, extraLabor
  ]);

  const totals = calculateTotals();

  // Copy total to clipboard
  const [copied, setCopied] = useState(false);
  const copyTotal = useCallback(() => {
    navigator.clipboard.writeText(`$${totals.grandTotal.toLocaleString()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [totals.grandTotal]);

  // Reset all fields
  const resetQuote = useCallback(() => {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      setPropertyAddress('');
      setCustomerName('');
      setHoverId('');
      setSidingProduct('carvedwood_044');
      setSidingProfile('D-4');
      setSidingColor('Harbor Gray');
      setG8Color('Charcoal');
      setCornerColor('White');
      setCornerSameAsSiding(true);
      setSidingSquares(0);
      setAdjustedSquares(0);
      setInsideCorners(0);
      setOutsideCorners(0);
      setIncludeFanFold(true);
      setIncludeRemoveDispose(false);
      setIncludeFullback(false);
      setSoffitLf(0);
      setSoffitWidthOver16(false);
      setFasciaLf(0);
      setFriezeLf(0);
      setPorchBeamLf(0);
      setSoldierRowLf(0);
      setPorchCeilingCount(0);
      setBirdBoxCount(0);
      setExtraBendLf(0);
      setRemoveSoffitLf(0);
      setWrapsAreMetal(false);
      setWindowWrapCount(0);
      setDoorWrapCount(0);
      setTransomWrapCount(0);
      setGarageSingleCount(0);
      setGarageDoubleCount(0);
      setVentCount(0);
      setCoverUtilitiesCount(0);
      setLightPanelCount(0);
      setReceptacleCount(0);
      setFaucetCount(0);
      setDryerVentCount(0);
      setShutterPairs(0);
      setColumns8ftCount(0);
      setColumns10ftCount(0);
      setNewGutterLf(0);
      setGutterCapLf(0);
      setMetalScreenLf(0);
      setRehangGutterLf(0);
      setRottenWoodLf(0);
      setOsbSheets(0);
      setFurOutCount(0);
      setHouseWrapRolls(0);
      setTrailerNeeded(false);
      setExtraLabor(0);
      setUploadedFile(null);
      setPdfViewerOpen(false);
      if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
    }
  }, [pdfObjectUrl]);

  // Generate line items for internal PDF
  const generateLineItems = useCallback(() => {
    const sidingPrice = SIDING_PRODUCTS[sidingProduct]?.price || 525;
    const items = [];

    // Use the manually-set adjusted squares (already includes waste)
    // Siding
    if (adjustedSquares > 0) {
      items.push({ name: `${SIDING_PRODUCTS[sidingProduct]?.name} Siding`, qty: adjustedSquares, rate: sidingPrice, total: adjustedSquares * sidingPrice });
    }
    if (includeFanFold && adjustedSquares > 0) {
      items.push({ name: 'Fan Fold Insulation', qty: adjustedSquares, rate: PRICING.fan_fold, total: adjustedSquares * PRICING.fan_fold });
    }
    if (includeRemoveDispose && adjustedSquares > 0) {
      items.push({ name: 'Remove & Dispose', qty: adjustedSquares, rate: PRICING.remove_dispose, total: adjustedSquares * PRICING.remove_dispose });
    }
    if (includeFullback && adjustedSquares > 0) {
      items.push({ name: 'Fullback Insulation', qty: adjustedSquares, rate: PRICING.fullback, total: adjustedSquares * PRICING.fullback });
    }
    if (insideCorners > 0) {
      items.push({ name: 'Inside Corners', qty: insideCorners, rate: PRICING.inside_corner, total: insideCorners * PRICING.inside_corner });
    }
    if (outsideCorners > 0) {
      items.push({ name: 'Outside Corners', qty: outsideCorners, rate: PRICING.outside_corner, total: outsideCorners * PRICING.outside_corner });
    }

    // Soffit/Fascia
    if (soffitLf > 0) {
      const soffitPrice = soffitWidthOver16 ? PRICING.soffit_over_16 : PRICING.soffit_under_16;
      items.push({ name: `Soffit (${soffitWidthOver16 ? '>16"' : '≤16"'})`, qty: soffitLf, rate: soffitPrice, total: soffitLf * soffitPrice });
    }
    if (fasciaLf > 0) {
      items.push({ name: 'Fascia', qty: fasciaLf, rate: PRICING.fascia, total: fasciaLf * PRICING.fascia });
    }
    if (friezeLf > 0) {
      items.push({ name: 'Frieze', qty: friezeLf, rate: PRICING.frieze, total: friezeLf * PRICING.frieze });
    }
    if (porchBeamLf > 0) {
      items.push({ name: 'Porch Beam', qty: porchBeamLf, rate: PRICING.porch_beam, total: porchBeamLf * PRICING.porch_beam });
    }
    if (soldierRowLf > 0) {
      items.push({ name: 'Soldier Row', qty: soldierRowLf, rate: PRICING.soldier_row, total: soldierRowLf * PRICING.soldier_row });
    }
    if (porchCeilingCount > 0) {
      items.push({ name: 'Porch Ceiling', qty: porchCeilingCount, rate: PRICING.porch_ceiling, total: porchCeilingCount * PRICING.porch_ceiling });
    }
    if (birdBoxCount > 0) {
      items.push({ name: 'Bird Boxes', qty: birdBoxCount, rate: PRICING.bird_box, total: birdBoxCount * PRICING.bird_box });
    }
    if (extraBendLf > 0) {
      items.push({ name: 'Extra Bend', qty: extraBendLf, rate: PRICING.extra_bend, total: extraBendLf * PRICING.extra_bend });
    }
    if (removeSoffitLf > 0) {
      items.push({ name: 'Remove Soffit', qty: removeSoffitLf, rate: PRICING.remove_soffit, total: removeSoffitLf * PRICING.remove_soffit });
    }

    // Wraps
    const windowWrapPrice = wrapsAreMetal ? PRICING.window_wrap_metal : PRICING.window_wrap_wood;
    const transomPrice = wrapsAreMetal ? PRICING.transom_wrap_metal : PRICING.transom_wrap_wood;
    if (windowWrapCount > 0) {
      items.push({ name: `Window Wraps (${wrapsAreMetal ? 'Metal' : 'Wood'})`, qty: windowWrapCount, rate: windowWrapPrice, total: windowWrapCount * windowWrapPrice });
    }
    if (doorWrapCount > 0) {
      items.push({ name: 'Door Wraps', qty: doorWrapCount, rate: PRICING.door_wrap, total: doorWrapCount * PRICING.door_wrap });
    }
    if (transomWrapCount > 0) {
      items.push({ name: `Transom Wraps (${wrapsAreMetal ? 'Metal' : 'Wood'})`, qty: transomWrapCount, rate: transomPrice, total: transomWrapCount * transomPrice });
    }
    if (garageSingleCount > 0) {
      items.push({ name: 'Single Garage Door Wraps', qty: garageSingleCount, rate: PRICING.garage_single, total: garageSingleCount * PRICING.garage_single });
    }
    if (garageDoubleCount > 0) {
      items.push({ name: 'Double Garage Door Wraps', qty: garageDoubleCount, rate: PRICING.garage_double, total: garageDoubleCount * PRICING.garage_double });
    }

    // Gutters
    if (newGutterLf > 0) {
      items.push({ name: 'New Gutters', qty: newGutterLf, rate: PRICING.new_gutters, total: newGutterLf * PRICING.new_gutters });
    }
    if (gutterCapLf > 0) {
      items.push({ name: 'Gutter Cap', qty: gutterCapLf, rate: PRICING.gutter_cap, total: gutterCapLf * PRICING.gutter_cap });
    }
    if (metalScreenLf > 0) {
      items.push({ name: 'Metal Screen', qty: metalScreenLf, rate: PRICING.metal_screen, total: metalScreenLf * PRICING.metal_screen });
    }
    if (rehangGutterLf > 0) {
      // Split into two line items: remove + rehang
      items.push({ name: 'Remove Existing Gutters', qty: rehangGutterLf, rate: PRICING.remove_gutters, total: rehangGutterLf * PRICING.remove_gutters });
      items.push({ name: 'Rehang Gutters', qty: rehangGutterLf, rate: PRICING.rehang_gutters, total: rehangGutterLf * PRICING.rehang_gutters });
    }

    // Accessories
    if (ventCount > 0) items.push({ name: 'Gable Vents', qty: ventCount, rate: PRICING.vent, total: ventCount * PRICING.vent });
    if (coverUtilitiesCount > 0) items.push({ name: 'Cover Utilities', qty: coverUtilitiesCount, rate: PRICING.cover_utilities, total: coverUtilitiesCount * PRICING.cover_utilities });
    if (lightPanelCount > 0) items.push({ name: 'Light Panels', qty: lightPanelCount, rate: PRICING.light_panel, total: lightPanelCount * PRICING.light_panel });
    if (receptacleCount > 0) items.push({ name: 'Receptacles', qty: receptacleCount, rate: PRICING.receptacle, total: receptacleCount * PRICING.receptacle });
    if (faucetCount > 0) items.push({ name: 'Faucets', qty: faucetCount, rate: PRICING.faucet, total: faucetCount * PRICING.faucet });
    if (dryerVentCount > 0) items.push({ name: 'Dryer Vents', qty: dryerVentCount, rate: PRICING.dryer_vent, total: dryerVentCount * PRICING.dryer_vent });
    if (shutterPairs > 0) items.push({ name: 'Shutter Pairs', qty: shutterPairs, rate: PRICING.shutters, total: shutterPairs * PRICING.shutters });
    if (columns8ftCount > 0) items.push({ name: 'Square Columns 8ft', qty: columns8ftCount, rate: PRICING.columns_8ft, total: columns8ftCount * PRICING.columns_8ft });
    if (columns10ftCount > 0) items.push({ name: 'Square Columns 10ft', qty: columns10ftCount, rate: PRICING.columns_10ft, total: columns10ftCount * PRICING.columns_10ft });
    if (rottenWoodLf > 0) items.push({ name: 'Rotten Wood', qty: rottenWoodLf, rate: PRICING.rotten_wood, total: rottenWoodLf * PRICING.rotten_wood });
    if (osbSheets > 0) items.push({ name: 'OSB Sheets', qty: osbSheets, rate: PRICING.osb_sheet, total: osbSheets * PRICING.osb_sheet });
    if (furOutCount > 0) items.push({ name: 'Fur Out (Wall/Chimney)', qty: furOutCount, rate: PRICING.fur_out, total: furOutCount * PRICING.fur_out });
    if (houseWrapRolls > 0) items.push({ name: 'House Wrap (incl)', qty: houseWrapRolls, rate: 0, total: 0 });

    // Cleanup (only if there's actual work) and Trailer (optional)
    const hasWork = adjustedSquares > 0 || soffitLf > 0 || fasciaLf > 0;
    if (hasWork) {
      items.push({ name: 'Disposal & Cleanup', qty: 1, rate: PRICING.cleanup, total: PRICING.cleanup });
      if (trailerNeeded) {
        items.push({ name: 'Trailer', qty: 1, rate: PRICING.trailer, total: PRICING.trailer });
      }
    }

    if (extraLabor > 0) {
      items.push({ name: 'Additional Labor', qty: 1, rate: extraLabor, total: extraLabor });
    }

    return items;
  }, [
    sidingProduct, adjustedSquares, includeFanFold, includeRemoveDispose, includeFullback,
    insideCorners, outsideCorners, soffitLf, soffitWidthOver16, fasciaLf, friezeLf, porchBeamLf,
    soldierRowLf, porchCeilingCount, birdBoxCount, extraBendLf, removeSoffitLf, wrapsAreMetal,
    windowWrapCount, doorWrapCount, transomWrapCount, garageSingleCount, garageDoubleCount,
    newGutterLf, gutterCapLf, metalScreenLf, rehangGutterLf, ventCount, coverUtilitiesCount,
    lightPanelCount, receptacleCount, faucetCount, dryerVentCount, shutterPairs,
    columns8ftCount, columns10ftCount, rottenWoodLf, osbSheets, furOutCount, houseWrapRolls,
    trailerNeeded, extraLabor
  ]);

  // Get color hex for display
  const getColorHex = useCallback((colorName) => {
    for (const category of Object.values(MASTIC_COLORS)) {
      const found = category.find(c => c.name === colorName);
      if (found) return found.hex;
    }
    return '#6B7280';
  }, []);

  const getG8ColorHex = useCallback((colorName) => {
    const found = G8_COLORS.find(c => c.name === colorName);
    return found ? found.hex : '#374151';
  }, []);

  // Export PDF
  const [isExporting, setIsExporting] = useState(false);
  const exportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const pdfData = {
        customerName,
        propertyAddress,
        sidingProduct: SIDING_PRODUCTS[sidingProduct]?.name || 'Siding',
        sidingProfile,
        sidingColor,
        sidingColorHex: getColorHex(sidingColor),
        g8Color,
        g8ColorHex: getG8ColorHex(g8Color),
        lineItems: generateLineItems(),
        totals,
        payWithCheck,
        isMilitary,
      };

      const PdfComponent = viewMode === 'internal' ? InternalQuotePDF : CustomerQuotePDF;
      const blob = await pdf(<PdfComponent data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const prefix = viewMode === 'internal' ? 'Internal' : 'Customer';
      const safeName = (customerName || 'Quote').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${prefix}_Quote_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [viewMode, customerName, propertyAddress, sidingProduct, sidingProfile, sidingColor, g8Color, totals, generateLineItems, getColorHex, getG8ColorHex, isMilitary, payWithCheck]);

  // PDF file processor (defined first for use in handlers)
  const processFile = useCallback(async (file) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setParseError(null);

    // Create object URL for PDF viewer
    if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
    const objectUrl = URL.createObjectURL(file);
    setPdfObjectUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/parse-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to parse PDF');
      }

      const measurements = await response.json();

      // Populate form with extracted values
      if (measurements.property_address) setPropertyAddress(measurements.property_address);
      if (measurements.customer_name) setCustomerName(measurements.customer_name);
      if (measurements.property_id) setHoverId(measurements.property_id);

      // Use ZERO WASTE base from PDF - user manually enters Order/Charge squares
      // Fallback chain: 0% waste → 10% waste (divide out) → 18% waste (divide out)
      let baseSquares = 0;
      if (measurements.siding_squares_0_waste) {
        baseSquares = measurements.siding_squares_0_waste;
      } else if (measurements.siding_squares_10_waste) {
        baseSquares = Math.round(measurements.siding_squares_10_waste / 1.10 * 10) / 10;
      } else if (measurements.siding_squares_18_waste) {
        baseSquares = Math.round(measurements.siding_squares_18_waste / 1.18 * 10) / 10;
      }
      if (baseSquares > 0) {
        setSidingSquares(baseSquares);
        // Don't auto-set adjustedSquares - user enters manually
      }

      if (measurements.inside_corners_count) setInsideCorners(measurements.inside_corners_count);
      if (measurements.outside_corners_count) setOutsideCorners(measurements.outside_corners_count);
      // Don't auto-set rehangGutterLf - user decides if gutter work is needed

      // Porch ceiling from Frieze Board data (extract first to subtract from soffit)
      const porchCeilingSqft = measurements.porch_ceiling_sqft || 0;
      if (porchCeilingSqft > 0) {
        // Convert sqft to count (each porch ceiling unit is $520, assumed ~100 sqft each)
        const porchCeilingUnits = Math.ceil(porchCeilingSqft / 100);
        setPorchCeilingCount(porchCeilingUnits);
      }

      // Porch beam LF (estimated from porch ceiling area)
      if (measurements.porch_beam_lf) {
        setPorchBeamLf(Math.round(measurements.porch_beam_lf));
      }

      // SOFFIT = Level Frieze + Sloped Frieze lengths (these are the soffit run lengths)
      // In Hover terminology, "Frieze Board" = soffit area along the eaves/rakes
      const levelFrieze = measurements.level_frieze_length || 0;
      const slopedFrieze = measurements.sloped_frieze_length || 0;
      if (levelFrieze || slopedFrieze) {
        setSoffitLf(Math.round(levelFrieze + slopedFrieze));
        // Don't auto-set removeSoffitLf - user decides if removal is needed
      }

      // FASCIA = Eaves Fascia + Rakes Fascia lengths (these are the fascia board lengths)
      const eavesFascia = measurements.eaves_fascia_length || 0;
      const rakesFascia = measurements.rakes_fascia_length || 0;
      if (eavesFascia || rakesFascia) {
        setFasciaLf(Math.round(eavesFascia + rakesFascia));
      }

    } catch (err) {
      setParseError('Could not parse PDF. Please check the file format.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [pdfObjectUrl]);

  // PDF upload handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setParseError('Please select a PDF file');
        return;
      }
      await processFile(file);
    }
  }, [processFile]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 100 100" fill="white">
                  <rect x="20" y="45" width="60" height="45" rx="4"/>
                  <path d="M50 12 L88 45 L12 45 Z"/>
                  <rect x="25" y="52" width="50" height="4" rx="2" fill="#0891b2"/>
                  <rect x="25" y="64" width="50" height="4" rx="2" fill="#0891b2"/>
                  <rect x="25" y="76" width="50" height="4" rx="2" fill="#0891b2"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-display">Siding Buddy</h1>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('internal')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'internal'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Internal
              </button>
              <button
                onClick={() => setViewMode('customer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'customer'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-4 h-4 inline mr-2" />
                Customer
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'internal' ? (
          <InternalView
            // PDF Upload
            isDragging={isDragging}
            uploadedFile={uploadedFile}
            isProcessing={isProcessing}
            parseError={parseError}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileSelect={handleFileSelect}
            // Property
            propertyAddress={propertyAddress}
            setPropertyAddress={setPropertyAddress}
            customerName={customerName}
            setCustomerName={setCustomerName}
            hoverId={hoverId}
            // Siding
            sidingProduct={sidingProduct}
            setSidingProduct={setSidingProduct}
            sidingProfile={sidingProfile}
            setSidingProfile={setSidingProfile}
            sidingColor={sidingColor}
            setSidingColor={setSidingColor}
            showSidingColors={showSidingColors}
            setShowSidingColors={setShowSidingColors}
            g8Color={g8Color}
            setG8Color={setG8Color}
            showG8Colors={showG8Colors}
            setShowG8Colors={setShowG8Colors}
            cornerColor={cornerColor}
            setCornerColor={setCornerColor}
            cornerSameAsSiding={cornerSameAsSiding}
            setCornerSameAsSiding={setCornerSameAsSiding}
            showCornerColors={showCornerColors}
            setShowCornerColors={setShowCornerColors}
            getColorHex={getColorHex}
            getG8ColorHex={getG8ColorHex}
            // Measurements
            sidingSquares={sidingSquares}
            setSidingSquares={setSidingSquares}
            adjustedSquares={adjustedSquares}
            setAdjustedSquares={setAdjustedSquares}
            insideCorners={insideCorners}
            setInsideCorners={setInsideCorners}
            outsideCorners={outsideCorners}
            setOutsideCorners={setOutsideCorners}
            // Labor
            includeFanFold={includeFanFold}
            setIncludeFanFold={setIncludeFanFold}
            includeRemoveDispose={includeRemoveDispose}
            setIncludeRemoveDispose={setIncludeRemoveDispose}
            includeFullback={includeFullback}
            setIncludeFullback={setIncludeFullback}
            // Soffit/Fascia
            soffitLf={soffitLf}
            setSoffitLf={setSoffitLf}
            soffitWidthOver16={soffitWidthOver16}
            setSoffitWidthOver16={setSoffitWidthOver16}
            fasciaLf={fasciaLf}
            setFasciaLf={setFasciaLf}
            friezeLf={friezeLf}
            setFriezeLf={setFriezeLf}
            porchBeamLf={porchBeamLf}
            setPorchBeamLf={setPorchBeamLf}
            soldierRowLf={soldierRowLf}
            setSoldierRowLf={setSoldierRowLf}
            porchCeilingCount={porchCeilingCount}
            setPorchCeilingCount={setPorchCeilingCount}
            birdBoxCount={birdBoxCount}
            setBirdBoxCount={setBirdBoxCount}
            extraBendLf={extraBendLf}
            setExtraBendLf={setExtraBendLf}
            removeSoffitLf={removeSoffitLf}
            setRemoveSoffitLf={setRemoveSoffitLf}
            // Wraps
            wrapsAreMetal={wrapsAreMetal}
            setWrapsAreMetal={setWrapsAreMetal}
            windowWrapCount={windowWrapCount}
            setWindowWrapCount={setWindowWrapCount}
            doorWrapCount={doorWrapCount}
            setDoorWrapCount={setDoorWrapCount}
            transomWrapCount={transomWrapCount}
            setTransomWrapCount={setTransomWrapCount}
            garageSingleCount={garageSingleCount}
            setGarageSingleCount={setGarageSingleCount}
            garageDoubleCount={garageDoubleCount}
            setGarageDoubleCount={setGarageDoubleCount}
            // Accessories
            ventCount={ventCount}
            setVentCount={setVentCount}
            coverUtilitiesCount={coverUtilitiesCount}
            setCoverUtilitiesCount={setCoverUtilitiesCount}
            lightPanelCount={lightPanelCount}
            setLightPanelCount={setLightPanelCount}
            receptacleCount={receptacleCount}
            setReceptacleCount={setReceptacleCount}
            faucetCount={faucetCount}
            setFaucetCount={setFaucetCount}
            dryerVentCount={dryerVentCount}
            setDryerVentCount={setDryerVentCount}
            shutterPairs={shutterPairs}
            setShutterPairs={setShutterPairs}
            columns8ftCount={columns8ftCount}
            setColumns8ftCount={setColumns8ftCount}
            columns10ftCount={columns10ftCount}
            setColumns10ftCount={setColumns10ftCount}
            // Gutters
            newGutterLf={newGutterLf}
            setNewGutterLf={setNewGutterLf}
            gutterCapLf={gutterCapLf}
            setGutterCapLf={setGutterCapLf}
            metalScreenLf={metalScreenLf}
            setMetalScreenLf={setMetalScreenLf}
            rehangGutterLf={rehangGutterLf}
            setRehangGutterLf={setRehangGutterLf}
            // Other
            rottenWoodLf={rottenWoodLf}
            setRottenWoodLf={setRottenWoodLf}
            osbSheets={osbSheets}
            setOsbSheets={setOsbSheets}
            furOutCount={furOutCount}
            setFurOutCount={setFurOutCount}
            houseWrapRolls={houseWrapRolls}
            setHouseWrapRolls={setHouseWrapRolls}
            trailerNeeded={trailerNeeded}
            setTrailerNeeded={setTrailerNeeded}
            extraLabor={extraLabor}
            setExtraLabor={setExtraLabor}
            // Totals
            totals={totals}
          />
        ) : (
          <CustomerView
            propertyAddress={propertyAddress}
            customerName={customerName}
            sidingProduct={SIDING_PRODUCTS[sidingProduct]?.name || 'Siding'}
            sidingColor={sidingColor}
            sidingProfile={sidingProfile}
            g8Color={g8Color}
            totals={totals}
            getColorHex={getColorHex}
            getG8ColorHex={getG8ColorHex}
            payWithCheck={payWithCheck}
            setPayWithCheck={setPayWithCheck}
            isMilitary={isMilitary}
            setIsMilitary={setIsMilitary}
          />
        )}
      </main>

      {/* PDF Viewer FAB - only visible when PDF is uploaded */}
      {pdfObjectUrl && (
        <button
          onClick={() => setPdfViewerOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-cyan-500 hover:bg-cyan-600 rounded-full shadow-lg
                   flex items-center justify-center transition-all z-40 hover:scale-105"
          title="View Hover PDF"
        >
          <FileText className="w-6 h-6 text-white" />
        </button>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && pdfObjectUrl && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setPdfViewerOpen(false)}
          />
          <div className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-slate-900 border border-slate-600
                        rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700 bg-slate-800">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{uploadedFile?.name || 'Hover PDF'}</span>
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Open in new tab button - works better on iOS */}
                <button
                  onClick={() => window.open(pdfObjectUrl, '_blank')}
                  className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPdfViewerOpen(false)}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* PDF Viewer - note on mobile */}
            <div className="flex-1 bg-slate-800 relative">
              {/* Mobile hint */}
              <div className="sm:hidden absolute top-4 left-4 right-4 bg-amber-500/90 text-black text-sm p-3 rounded-lg z-10 text-center">
                PDF may not display on mobile. Tap the <ExternalLink className="w-4 h-4 inline" /> button to open in a new tab.
              </div>
              <iframe
                src={pdfObjectUrl}
                className="w-full h-full border-0"
                title="Hover PDF Viewer"
              />
            </div>
          </div>
        </>
      )}

      {/* Floating Total Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 z-50 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Total - compact on mobile */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Project Total</p>
                <p className="text-xl sm:text-3xl font-bold text-white font-mono truncate">
                  ${totals.grandTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={copyTotal}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white
                         transition-all border border-slate-600 flex-shrink-0"
                title="Copy total to clipboard"
              >
                {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={resetQuote}
                className="p-2 sm:px-4 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg
                         transition-all flex items-center gap-2 border border-slate-600"
                title="Reset quote"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={exportPDF}
                disabled={isExporting}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-700 disabled:cursor-wait
                         text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INTERNAL VIEW
// ============================================================================

function InternalView(props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* PDF Upload */}
      <Card title="Hover PDF Upload" icon={<Upload className="w-5 h-5" />}>
        <div
          onDragOver={props.handleDragOver}
          onDragLeave={props.handleDragLeave}
          onDrop={props.handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${props.isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500'}
                    ${props.uploadedFile ? 'bg-green-500/10 border-green-500/50' : ''}`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={props.handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            {props.isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-300">Processing PDF...</p>
              </div>
            ) : props.uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-green-400 font-medium">{props.uploadedFile.name}</p>
                <p className="text-sm text-slate-400">Click to upload a different file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-slate-500" />
                <p className="text-slate-300">Drag & drop Hover PDF here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
              </div>
            )}
          </label>
          {props.parseError && (
            <p className="mt-4 text-red-400 text-sm">{props.parseError}</p>
          )}
        </div>
      </Card>

      {/* Property Info */}
      <Card title="Property Information" icon={<Building2 className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            value={props.customerName}
            onChange={(e) => props.setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
          <Input
            label="Hover ID"
            value={props.hoverId}
            readOnly
            placeholder="Auto-filled from PDF"
          />
          <div className="md:col-span-2">
            <Input
              label="Property Address"
              value={props.propertyAddress}
              onChange={(e) => props.setPropertyAddress(e.target.value)}
              placeholder="123 Main Street, Macon, GA 31216"
            />
          </div>
        </div>
      </Card>

      {/* Siding Selection */}
      <Card title="Siding Selection" icon={<Palette className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Product"
            value={props.sidingProduct}
            onChange={(e) => props.setSidingProduct(e.target.value)}
            options={Object.entries(SIDING_PRODUCTS).map(([key, val]) => ({
              value: key,
              label: `${val.name} - $${val.price}/sq`
            }))}
          />
          <Select
            label="Profile"
            value={props.sidingProfile}
            onChange={(e) => props.setSidingProfile(e.target.value)}
            options={PROFILES.map(p => ({ value: p, label: p }))}
          />
          <div className="relative">
            <label className="block text-sm text-slate-400 mb-1">Siding Color</label>
            <button
              onClick={() => props.setShowSidingColors(!props.showSidingColors)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-left
                       flex items-center justify-between hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-slate-500"
                  style={{ backgroundColor: props.getColorHex(props.sidingColor) }}
                />
                <span className="text-white">{props.sidingColor}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {props.showSidingColors && (
              <ColorPicker
                colors={MASTIC_COLORS}
                selected={props.sidingColor}
                onSelect={(color) => {
                  props.setSidingColor(color);
                  props.setShowSidingColors(false);
                }}
                onClose={() => props.setShowSidingColors(false)}
              />
            )}
          </div>
          <div className="relative">
            <label className="block text-sm text-slate-400 mb-1">G8 Trim Color</label>
            <button
              onClick={() => props.setShowG8Colors(!props.showG8Colors)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-left
                       flex items-center justify-between hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-slate-500"
                  style={{ backgroundColor: props.getG8ColorHex(props.g8Color) }}
                />
                <span className="text-white">{props.g8Color}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {props.showG8Colors && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-800 border border-slate-600
                            rounded-lg shadow-xl z-50">
                <div className="grid grid-cols-5 gap-2">
                  {G8_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        props.setG8Color(color.name);
                        props.setShowG8Colors(false);
                      }}
                      className={`w-10 h-10 rounded-lg border-2 transition-all
                                ${props.g8Color === color.name
                                  ? 'border-cyan-500 scale-110'
                                  : 'border-slate-600 hover:border-slate-400'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Corner Color Selection */}
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={props.cornerSameAsSiding}
                onChange={(e) => props.setCornerSameAsSiding(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300 text-sm">Corners same as siding</span>
            </label>
          </div>
          {!props.cornerSameAsSiding && (
            <div className="relative">
              <label className="block text-sm text-slate-400 mb-1">Corner Color</label>
              <button
                onClick={() => props.setShowCornerColors(!props.showCornerColors)}
                className="w-full max-w-xs px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-left
                         flex items-center justify-between hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-slate-500"
                    style={{ backgroundColor: props.getColorHex(props.cornerColor) }}
                  />
                  <span className="text-white">{props.cornerColor}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {props.showCornerColors && (
                <ColorPicker
                  colors={MASTIC_COLORS}
                  selected={props.cornerColor}
                  onSelect={(color) => {
                    props.setCornerColor(color);
                    props.setShowCornerColors(false);
                  }}
                  onClose={() => props.setShowCornerColors(false)}
                />
              )}
            </div>
          )}
          {props.cornerSameAsSiding && (
            <p className="text-xs text-slate-500">
              Corners will be {props.sidingColor} (same as siding)
            </p>
          )}
        </div>

      </Card>

      {/* Measurements */}
      <Card title="Measurements (from PDF)" icon={<Calculator className="w-5 h-5" />}>
        {/* Siding Squares */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <NumberInput
            label="Base Squares"
            value={props.sidingSquares}
            onChange={(val) => props.setSidingSquares(val)}
            step={0.5}
          />
          <div>
            <NumberInput
              label="Order/Charge Squares"
              value={props.adjustedSquares}
              onChange={(val) => props.setAdjustedSquares(val)}
              step={1}
            />
            {props.adjustedSquares > 0 && props.sidingSquares > 0 && (
              <p className="text-xs text-cyan-400 mt-1">
                Waste: {(((props.adjustedSquares / props.sidingSquares) - 1) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            label="Inside Corners"
            value={props.insideCorners}
            onChange={(val) => props.setInsideCorners(val)}
          />
          <NumberInput
            label="Outside Corners"
            value={props.outsideCorners}
            onChange={(val) => props.setOutsideCorners(val)}
          />
        </div>

        {/* Labor toggles */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Toggle
            label="Fan Fold"
            checked={props.includeFanFold}
            onChange={props.setIncludeFanFold}
          />
          <div className="flex items-center gap-2">
            <Toggle
              label="Remove/Dispose Existing Siding"
              checked={props.includeRemoveDispose}
              onChange={props.setIncludeRemoveDispose}
            />
            <span className="text-xs text-slate-500">(vinyl only)</span>
          </div>
          <Toggle
            label="Fullback Insulation"
            checked={props.includeFullback}
            onChange={props.setIncludeFullback}
          />
        </div>
      </Card>

      {/* Soffit & Fascia */}
      <Card title="Soffit & Fascia">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <NumberInput
              label="Soffit (LF)"
              value={props.soffitLf}
              onChange={(val) => props.setSoffitLf(val)}
            />
            <div className="mt-2">
              <Toggle
                label="Width > 16 inch"
                checked={props.soffitWidthOver16}
                onChange={props.setSoffitWidthOver16}
                small
              />
            </div>
          </div>
          <NumberInput
            label="Fascia (LF) - $8"
            value={props.fasciaLf}
            onChange={(val) => props.setFasciaLf(val)}
          />
          <NumberInput
            label="Frieze (LF) - $6"
            value={props.friezeLf}
            onChange={(val) => props.setFriezeLf(val)}
          />
          <NumberInput
            label="Porch Beam (LF)"
            value={props.porchBeamLf}
            onChange={(val) => props.setPorchBeamLf(val)}
          />
          <NumberInput
            label="Soldier Row (LF) - $9"
            value={props.soldierRowLf}
            onChange={(val) => props.setSoldierRowLf(val)}
          />
          <NumberInput
            label="Porch Ceiling (ea)"
            value={props.porchCeilingCount}
            onChange={(val) => props.setPorchCeilingCount(val)}
          />
          <NumberInput
            label="Bird Boxes (ea)"
            value={props.birdBoxCount}
            onChange={(val) => props.setBirdBoxCount(val)}
          />
          <NumberInput
            label="Extra Bend (LF)"
            value={props.extraBendLf}
            onChange={(val) => props.setExtraBendLf(val)}
          />
          <NumberInput
            label="Remove Soffit (LF)"
            value={props.removeSoffitLf}
            onChange={(val) => props.setRemoveSoffitLf(val)}
          />
        </div>
      </Card>

      {/* Wraps */}
      <Card title="Wraps (G8 Trim Coil)">
        <div className="mb-4">
          <Toggle
            label={`Window/Transom: ${props.wrapsAreMetal ? "Metal/Vinyl ($152)" : "Wood ($125)"}`}
            checked={props.wrapsAreMetal}
            onChange={props.setWrapsAreMetal}
          />
          <p className="text-xs text-slate-500 mt-1">Doors are $150 flat rate</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NumberInput
            label="Window Wraps"
            value={props.windowWrapCount}
            onChange={(val) => props.setWindowWrapCount(val)}
          />
          <NumberInput
            label="Door Wraps ($150)"
            value={props.doorWrapCount}
            onChange={(val) => props.setDoorWrapCount(val)}
          />
          <NumberInput
            label="Transom Wraps"
            value={props.transomWrapCount}
            onChange={(val) => props.setTransomWrapCount(val)}
          />
          <NumberInput
            label="Single Garage ($175)"
            value={props.garageSingleCount}
            onChange={(val) => props.setGarageSingleCount(val)}
          />
          <NumberInput
            label="Double Garage ($250)"
            value={props.garageDoubleCount}
            onChange={(val) => props.setGarageDoubleCount(val)}
          />
        </div>
      </Card>

      {/* Accessories */}
      <Card title="Accessories">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NumberInput
            label="Gable Vents ($140)"
            value={props.ventCount}
            onChange={(val) => props.setVentCount(val)}
          />
          <NumberInput
            label="Cover Utilities ($140)"
            value={props.coverUtilitiesCount}
            onChange={(val) => props.setCoverUtilitiesCount(val)}
          />
          <NumberInput
            label="Light Panels ($30)"
            value={props.lightPanelCount}
            onChange={(val) => props.setLightPanelCount(val)}
          />
          <NumberInput
            label="Receptacles ($19)"
            value={props.receptacleCount}
            onChange={(val) => props.setReceptacleCount(val)}
          />
          <NumberInput
            label="Faucets ($19)"
            value={props.faucetCount}
            onChange={(val) => props.setFaucetCount(val)}
          />
          <NumberInput
            label="Dryer Vents ($37)"
            value={props.dryerVentCount}
            onChange={(val) => props.setDryerVentCount(val)}
          />
          <NumberInput
            label="Shutter Pairs ($250)"
            value={props.shutterPairs}
            onChange={(val) => props.setShutterPairs(val)}
          />
          <NumberInput
            label="Columns 8ft ($350)"
            value={props.columns8ftCount}
            onChange={(val) => props.setColumns8ftCount(val)}
          />
          <NumberInput
            label="Columns 10ft ($400)"
            value={props.columns10ftCount}
            onChange={(val) => props.setColumns10ftCount(val)}
          />
        </div>
      </Card>

      {/* Gutters */}
      <Card title="Gutters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            label="New Gutters (LF) - $16"
            value={props.newGutterLf}
            onChange={(val) => props.setNewGutterLf(val)}
          />
          <NumberInput
            label="Gutter Cap (LF) - $8"
            value={props.gutterCapLf}
            onChange={(val) => props.setGutterCapLf(val)}
          />
          <NumberInput
            label="Metal Screen (LF) - $3.50"
            value={props.metalScreenLf}
            onChange={(val) => props.setMetalScreenLf(val)}
          />
          <NumberInput
            label="Remove/Rehang (LF) - $4"
            value={props.rehangGutterLf}
            onChange={(val) => props.setRehangGutterLf(val)}
          />
        </div>
      </Card>

      {/* Other */}
      <Card title="Other">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInput
            label="Rotten Wood (LF)"
            value={props.rottenWoodLf}
            onChange={(val) => props.setRottenWoodLf(val)}
          />
          <NumberInput
            label="OSB Sheets"
            value={props.osbSheets}
            onChange={(val) => props.setOsbSheets(val)}
          />
          <NumberInput
            label="Fur Out ($250 ea)"
            value={props.furOutCount}
            onChange={(val) => props.setFurOutCount(val)}
          />
          <NumberInput
            label="House Wrap Rolls (incl.)"
            value={props.houseWrapRolls}
            onChange={(val) => props.setHouseWrapRolls(val)}
          />
          <div>
            <label className="block text-sm text-slate-400 mb-1">Disposal & Cleanup</label>
            <div className="text-white font-mono mb-2">$250 <span className="text-slate-400 text-sm">(included)</span></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={props.trailerNeeded}
                onChange={(e) => props.setTrailerNeeded(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300 text-sm">Add Trailer (+$150)</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <NumberInput
            label="Additional Labor/Fuel ($)"
            value={props.extraLabor}
            onChange={(val) => props.setExtraLabor(val)}
            prefix="$"
          />
        </div>
      </Card>

      {/* Running Totals */}
      <Card title="Quote Summary" highlight>
        <div className="space-y-3">
          <TotalRow label="Siding Package" value={props.totals.sidingTotal} />
          <TotalRow label="Soffit & Fascia" value={props.totals.soffitTotal} />
          <TotalRow label="Wraps" value={props.totals.wrapsTotal} />
          <TotalRow label="Gutters" value={props.totals.guttersTotal} />
          <TotalRow label="Other" value={props.totals.otherTotal} />
          <div className="border-t border-slate-600 pt-3 mt-3">
            <TotalRow label="GRAND TOTAL" value={props.totals.grandTotal} large />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// CUSTOMER VIEW
// ============================================================================

function CustomerView({ propertyAddress, customerName, sidingProduct, sidingColor, sidingProfile, g8Color, totals, getColorHex, getG8ColorHex, payWithCheck, setPayWithCheck, isMilitary, setIsMilitary }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate discounts
  // Check discount: only affects cash payment (NOT financing)
  // Military discount: affects BOTH cash payment AND financing
  const checkDiscount = payWithCheck ? 0.02 : 0;
  const militaryDiscount = isMilitary ? 0.03 : 0;

  // For cash payment: both discounts apply
  const cashDiscountPercent = checkDiscount + militaryDiscount;
  const cashDiscountAmount = Math.round(totals.grandTotal * cashDiscountPercent);
  const cashTotal = totals.grandTotal - cashDiscountAmount;
  const halfPayment = Math.ceil(cashTotal / 2);

  // For financing: only military discount applies
  const financeDiscountAmount = Math.round(totals.grandTotal * militaryDiscount);
  const financeGrandTotal = totals.grandTotal - financeDiscountAmount;
  const downPayment = Math.ceil(financeGrandTotal * 0.10);
  const financeAmount = Math.floor(financeGrandTotal * 0.90);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-white font-display">Siding Quote</h2>
        <div className="flex items-center justify-center gap-2 mt-3 text-slate-300">
          <span>Consultant: Brooks Rumney</span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            (478) 747-0020
          </span>
        </div>
      </div>

      {/* Quote Header */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-400">PREPARED FOR</p>
            <p className="text-xl font-semibold text-white">{customerName || 'Customer'}</p>
            <p className="text-slate-400 mt-1">{propertyAddress || 'Property Address'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">DATE</p>
            <p className="text-white">{today}</p>
          </div>
        </div>
      </div>

      {/* Selections */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Selections</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded border border-slate-500"
              style={{ backgroundColor: getColorHex(sidingColor) }}
            />
            <div>
              <p className="text-white">{sidingProduct} - {sidingProfile}</p>
              <p className="text-sm text-slate-400">{sidingColor}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded border border-slate-500"
              style={{ backgroundColor: getG8ColorHex(g8Color) }}
            />
            <div>
              <p className="text-white">G8 Performance Trim Coil</p>
              <p className="text-sm text-slate-400">{g8Color}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summary - 2 Packages Only */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>
        <div className="space-y-4">
          {totals.sidingPackageTotal > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">Siding Package</p>
                <p className="text-sm text-slate-400">Complete siding installation with trim</p>
              </div>
              <p className="text-white font-mono">${totals.sidingPackageTotal.toLocaleString()}</p>
            </div>
          )}
          {totals.soffitFasciaPackageTotal > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">Soffit & Fascia Package</p>
                <p className="text-sm text-slate-400">Complete soffit, fascia & gutter work</p>
              </div>
              <p className="text-white font-mono">${totals.soffitFasciaPackageTotal.toLocaleString()}</p>
            </div>
          )}

          <div className="border-t border-slate-600 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-white">PROJECT TOTAL</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">
                ${totals.grandTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options (No Financing) */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Options (No Financing)</h3>

        {/* Standard 50/50 Split */}
        <div className="mb-4 p-4 bg-slate-800 rounded-lg">
          <p className="text-slate-400 text-sm mb-3">Standard Payment Split</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400">50% Upfront</p>
              <p className="text-xl font-bold text-white font-mono">${halfPayment.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-400">50% On Completion</p>
              <p className="text-xl font-bold text-white font-mono">${halfPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Discount Toggles */}
        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-800 rounded-lg hover:bg-slate-700/80 transition-colors">
            <input
              type="checkbox"
              checked={payWithCheck}
              onChange={(e) => setPayWithCheck(e.target.checked)}
              className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <div className="flex-1">
              <p className="text-white font-medium">Pay with Check</p>
              <p className="text-sm text-slate-400">2% discount applied</p>
            </div>
            <span className="text-cyan-400 font-mono font-medium">-2%</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-800 rounded-lg hover:bg-slate-700/80 transition-colors">
            <input
              type="checkbox"
              checked={isMilitary}
              onChange={(e) => setIsMilitary(e.target.checked)}
              className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <div className="flex-1">
              <p className="text-white font-medium">Military Discount</p>
              <p className="text-sm text-slate-400">3% discount for veterans & active duty</p>
            </div>
            <span className="text-cyan-400 font-mono font-medium">-3%</span>
          </label>
        </div>

        {/* Discount Summary (only show if discounts applied) */}
        {cashDiscountPercent > 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400">Your Discount ({Math.round(cashDiscountPercent * 100)}%)</span>
              <span className="text-xl font-bold text-green-400 font-mono">
                -${cashDiscountAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-green-500/20">
              <span className="text-white font-medium">Discounted Total</span>
              <span className="text-xl font-bold text-white font-mono">
                ${cashTotal.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-400">50% Upfront</p>
                <p className="text-lg font-bold text-white font-mono">${halfPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">50% On Completion</p>
                <p className="text-lg font-bold text-white font-mono">${halfPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financing Options */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Financing Options</h3>

        {/* Military discount note */}
        {isMilitary && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              Military discount (3%) applied to financing: -${financeDiscountAmount.toLocaleString()}
            </p>
          </div>
        )}

        {/* 10% Down Payment */}
        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300">10% Down Payment</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              ${downPayment.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Amount to Finance</span>
            <span className="text-white font-mono">
              ${financeAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Monthly Payment Options */}
        <p className="text-sm text-slate-400 mb-3">Monthly Payments (Wells Fargo)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FinancingOption
            months={12}
            apr={0}
            principal={financeAmount}
          />
          <FinancingOption
            months={48}
            apr={8.99}
            principal={financeAmount}
          />
          <FinancingOption
            months={120}
            apr={9.99}
            principal={financeAmount}
          />
        </div>
      </div>

    </div>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function Card({ title, icon, children, highlight }) {
  return (
    <div className={`bg-slate-900 border rounded-xl overflow-hidden
                   ${highlight ? 'border-cyan-500/50' : 'border-slate-700'}`}>
      {title && (
        <div className={`px-4 py-3 border-b flex items-center gap-2
                       ${highlight ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700'}`}>
          {icon && <span className="text-slate-400">{icon}</span>}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white
                 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
        {...props}
      />
    </div>
  );
}

function NumberInput({ label, value, onChange, step = 1, prefix }) {
  // Allow empty string for display, treat as 0 in calculations
  const displayValue = value === 0 ? '' : value;

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || val === null) {
      onChange(0);
    } else {
      const num = parseFloat(val);
      onChange(isNaN(num) ? 0 : num);
    }
  };

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>
        )}
        <input
          type="number"
          value={displayValue}
          onChange={handleChange}
          step={step}
          inputMode="decimal"
          className={`w-full py-2 bg-slate-800 border border-slate-600 rounded-lg text-white
                   focus:border-cyan-500 focus:outline-none transition-colors font-mono
                   ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white
                 focus:border-cyan-500 focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange, small }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors
                  ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${checked ? 'translate-x-5' : 'translate-x-1'}`}
        />
      </div>
      <span className={`text-slate-300 ${small ? 'text-xs' : 'text-sm'}`}>{label}</span>
    </label>
  );
}

function TotalRow({ label, value, large }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${large ? 'text-lg font-bold text-white' : 'text-slate-300'}`}>{label}</span>
      <span className={`font-mono ${large ? 'text-xl font-bold text-cyan-400' : 'text-white'}`}>
        ${value.toLocaleString()}
      </span>
    </div>
  );
}

function FinancingOption({ months, apr, principal }) {
  // Calculate monthly payment: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const calculateMonthly = () => {
    if (apr === 0) {
      return principal / months;
    }
    const r = apr / 100 / 12; // Monthly rate
    const n = months;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const monthly = calculateMonthly();

  return (
    <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
      <p className="text-2xl font-bold text-white font-mono">
        ${Math.round(monthly).toLocaleString()}
        <span className="text-sm text-slate-400 font-normal">/mo</span>
      </p>
      <p className="font-semibold text-slate-300">
        {months} months
      </p>
      <p className="text-xs text-slate-500">
        {apr === 0 ? '0% APR' : `${apr}% APR`}
      </p>
    </div>
  );
}

function ColorPicker({ colors, selected, onSelect, onClose }) {
  return (
    <>
      {/* Full-screen modal overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-slate-900 border border-slate-600
                    rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Select Siding Color</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color grid - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(colors).map(([category, colorList]) => (
            <div key={category} className="mb-8">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 capitalize">
                {category}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {colorList.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => onSelect(color.name)}
                    className={`group relative aspect-square rounded-xl border-3 transition-all
                              ${selected === color.name
                                ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 shadow-lg'
                                : 'border-slate-600 hover:border-slate-400 hover:scale-102'}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selected === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Check className="w-5 h-5 text-cyan-600" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {/* Color names below swatches */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mt-2">
                {colorList.map((color) => (
                  <p
                    key={color.name}
                    className={`text-xs text-center truncate ${
                      selected === color.name ? 'text-cyan-400 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {color.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer with selected color */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-slate-500"
                style={{ backgroundColor: Object.values(colors).flat().find(c => c.name === selected)?.hex || '#6B7280' }}
              />
              <div>
                <p className="text-sm text-slate-400">Selected Color</p>
                <p className="text-lg font-semibold text-white">{selected}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
