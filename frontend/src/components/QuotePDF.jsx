import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Compact, professional styles - Industrial/Utilitarian aesthetic
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  // Header - Compact, no-nonsense
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '2 solid #0891b2',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quoteDate: {
    fontSize: 9,
    color: '#475569',
  },
  quoteBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
  },
  quoteBadgeText: {
    fontSize: 7,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Info Row - Compact two-column layout
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoBlock: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
    borderLeft: '3 solid #0891b2',
  },
  infoLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  infoValueSmall: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1,
  },
  // Specs Row - Color swatches inline
  specsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 2,
    border: '1 solid #cbd5e1',
  },
  specLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  specValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  // Table styles - Tight and efficient
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: '1 solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '0.5 solid #e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
  },
  tableCellBold: {
    fontWeight: 'bold',
  },
  col1: { flex: 4 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1.2, textAlign: 'right' },
  // Totals - Compact summary
  totalsSection: {
    marginTop: 12,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 8,
  },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '48%',
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 2,
  },
  totalLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  grandTotalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0f172a',
    borderRadius: 3,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22d3ee',
  },
  // Customer PDF - Package cards
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
    borderLeft: '3 solid #0891b2',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  packageDesc: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  // Payment section - Cash/Check Option
  cashPaymentSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    border: '1 solid #86efac',
  },
  cashPaymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cashPaymentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cashPaymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  cashPaymentOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    alignItems: 'center',
    border: '1 solid #dcfce7',
  },
  cashPaymentLabel: {
    fontSize: 7,
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cashPaymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803d',
  },
  cashPaymentNote: {
    fontSize: 7,
    color: '#4ade80',
    marginTop: 2,
  },
  // Discount badge
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#dcfce7',
    borderRadius: 3,
  },
  discountBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#166534',
  },
  // Savings row
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1 dashed #86efac',
  },
  savingsLabel: {
    fontSize: 8,
    color: '#166534',
  },
  savingsAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#15803d',
  },
  // Cash discount note (when not applied)
  cashDiscountNote: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fefce8',
    borderRadius: 2,
    border: '1 solid #fef08a',
  },
  cashDiscountNoteText: {
    fontSize: 7,
    color: '#854d0e',
    textAlign: 'center',
  },
  // Financing section
  paymentSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
    border: '1 solid #e2e8f0',
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentOption: {
    flex: 1,
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  paymentPeriod: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  // Military discount badge for financing
  militaryDiscountNote: {
    marginTop: 6,
    padding: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 2,
  },
  militaryDiscountText: {
    fontSize: 7,
    color: '#1e40af',
    textAlign: 'center',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '0.5 solid #e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  // Discount price comparison styles
  grandTotalBarWithDiscount: {
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 3,
  },
  priceComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecoration: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  discountBreakdown: {
    borderTop: '1 solid #334155',
    paddingTop: 6,
    marginTop: 4,
  },
  discountLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  discountLineLabel: {
    fontSize: 8,
    color: '#94a3b8',
  },
  discountLineValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4ade80',
  },
});

// Helper function to format currency
const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '$0';
  return `$${value.toLocaleString()}`;
};

// Calculate monthly payment
const calculateMonthly = (principal, apr, months) => {
  if (apr === 0) return principal / months;
  const r = apr / 100 / 12;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

// ============================================================================
// INTERNAL PDF - Itemized breakdown, compact layout
// ============================================================================

export function InternalQuotePDF({ data }) {
  const {
    customerName,
    propertyAddress,
    sidingProduct,
    sidingProfile,
    sidingColor,
    sidingColorHex,
    g8Color,
    g8ColorHex,
    lineItems = [],
    totals = {},
  } = data;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Siding Quote</Text>
            <Text style={styles.headerSubtitle}>Itemized Estimate</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteDate}>{today}</Text>
            <View style={styles.quoteBadge}>
              <Text style={styles.quoteBadgeText}>Internal Copy</Text>
            </View>
          </View>
        </View>

        {/* Customer & Specs Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{customerName || 'N/A'}</Text>
            <Text style={styles.infoValueSmall}>{propertyAddress || 'N/A'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Product</Text>
            <Text style={styles.infoValue}>{sidingProduct}</Text>
            <Text style={styles.infoValueSmall}>Profile: {sidingProfile}</Text>
          </View>
        </View>

        {/* Color Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <View style={[styles.swatch, { backgroundColor: sidingColorHex || '#6B7280' }]} />
            <View>
              <Text style={styles.specLabel}>Siding</Text>
              <Text style={styles.specValue}>{sidingColor}</Text>
            </View>
          </View>
          <View style={styles.specItem}>
            <View style={[styles.swatch, { backgroundColor: g8ColorHex || '#374151' }]} />
            <View>
              <Text style={styles.specLabel}>G8 Trim</Text>
              <Text style={styles.specValue}>{g8Color}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.col4]}>Total</Text>
            </View>
            {lineItems.map((item, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.col1]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.qty}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(item.rate)}</Text>
                <Text style={[styles.tableCell, styles.col4, styles.tableCellBold]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals Summary */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsGrid}>
            {totals.sidingTotal > 0 && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Siding</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.sidingTotal)}</Text>
              </View>
            )}
            {totals.soffitTotal > 0 && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Soffit/Fascia</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.soffitTotal)}</Text>
              </View>
            )}
            {totals.wrapsTotal > 0 && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Wraps</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.wrapsTotal)}</Text>
              </View>
            )}
            {totals.guttersTotal > 0 && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Gutters</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.guttersTotal)}</Text>
              </View>
            )}
            {totals.otherTotal > 0 && (
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>Other</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.otherTotal)}</Text>
              </View>
            )}
          </View>
          <View style={styles.grandTotalBar}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(totals.grandTotal)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Internal Use Only</Text>
          <Text style={styles.footerText}>Generated {today}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================================
// CUSTOMER PDF - Simplified package view with cash payment focus
// ============================================================================

export function CustomerQuotePDF({ data }) {
  const {
    customerName,
    propertyAddress,
    sidingProduct,
    sidingProfile,
    sidingColor,
    sidingColorHex,
    g8Color,
    g8ColorHex,
    totals = {},
    payWithCheck = false,
    isMilitary = false,
  } = data;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const grandTotal = totals.grandTotal || 0;

  // Calculate discounts
  // Check/cash discount (2%): only applies to cash payment
  // Military discount (3%): applies to BOTH cash and financing
  const checkDiscount = payWithCheck ? 0.02 : 0;
  const militaryDiscount = isMilitary ? 0.03 : 0;

  // Cash payment: both discounts can apply
  const cashDiscountPercent = checkDiscount + militaryDiscount;
  const cashDiscountAmount = Math.round(grandTotal * cashDiscountPercent);
  const cashTotal = grandTotal - cashDiscountAmount;

  // 50% split is based on DISCOUNTED price (cashTotal)
  const halfDeposit = Math.ceil(cashTotal / 2);
  const halfCompletion = Math.floor(cashTotal / 2);

  // For financing: only military discount applies
  const financeDiscountAmount = Math.round(grandTotal * militaryDiscount);
  const financeGrandTotal = grandTotal - financeDiscountAmount;
  const financeAmount = financeGrandTotal * 0.90;
  const downPayment = financeGrandTotal * 0.10;

  // Combine gutters into soffit/fascia for customer view
  const soffitFasciaCombined = (totals.soffitTotal || 0) + (totals.guttersTotal || 0);

  // Check if any discounts are applied
  const hasDiscountsApplied = payWithCheck || isMilitary;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header - No "Valid 30 Days" badge */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Project Estimate</Text>
            <Text style={styles.headerSubtitle}>Siding Installation</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteDate}>{today}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Prepared For</Text>
            <Text style={styles.infoValue}>{customerName || 'Valued Customer'}</Text>
            <Text style={styles.infoValueSmall}>{propertyAddress || ''}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Product Selection</Text>
            <Text style={styles.infoValue}>{sidingProduct}</Text>
            <Text style={styles.infoValueSmall}>Profile: {sidingProfile}</Text>
          </View>
        </View>

        {/* Color Specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <View style={[styles.swatch, { backgroundColor: sidingColorHex || '#6B7280' }]} />
            <View>
              <Text style={styles.specLabel}>Siding Color</Text>
              <Text style={styles.specValue}>{sidingColor}</Text>
            </View>
          </View>
          <View style={styles.specItem}>
            <View style={[styles.swatch, { backgroundColor: g8ColorHex || '#374151' }]} />
            <View>
              <Text style={styles.specLabel}>Trim Color</Text>
              <Text style={styles.specValue}>{g8Color}</Text>
            </View>
          </View>
        </View>

        {/* Package Summary - Gutters merged into Soffit & Fascia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Summary</Text>

          {totals.sidingTotal > 0 && (
            <View style={styles.packageRow}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>Siding Package</Text>
                <Text style={styles.packageDesc}>Premium siding with installation, corners & disposal</Text>
              </View>
              <Text style={styles.packagePrice}>{formatCurrency(totals.sidingTotal)}</Text>
            </View>
          )}

          {soffitFasciaCombined > 0 && (
            <View style={styles.packageRow}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>Soffit & Fascia Package</Text>
                <Text style={styles.packageDesc}>Complete soffit, fascia, and exterior installation</Text>
              </View>
              <Text style={styles.packagePrice}>{formatCurrency(soffitFasciaCombined)}</Text>
            </View>
          )}

          {totals.wrapsTotal > 0 && (
            <View style={styles.packageRow}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>Trim & Wraps</Text>
                <Text style={styles.packageDesc}>Window, door, and trim wrapping</Text>
              </View>
              <Text style={styles.packagePrice}>{formatCurrency(totals.wrapsTotal)}</Text>
            </View>
          )}

          {totals.otherTotal > 0 && (
            <View style={styles.packageRow}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>Additional Services</Text>
                <Text style={styles.packageDesc}>Accessories, repairs, and cleanup</Text>
              </View>
              <Text style={styles.packagePrice}>{formatCurrency(totals.otherTotal)}</Text>
            </View>
          )}
        </View>

        {/* Grand Total - with discount comparison when applicable */}
        {hasDiscountsApplied ? (
          <View style={styles.grandTotalBarWithDiscount}>
            <View style={styles.priceComparisonRow}>
              <Text style={styles.grandTotalLabel}>Project Total</Text>
              <View style={styles.priceComparison}>
                <Text style={styles.originalPrice}>{formatCurrency(grandTotal)}</Text>
                <Text style={styles.discountedPrice}>{formatCurrency(cashTotal)}</Text>
              </View>
            </View>
            <View style={styles.discountBreakdown}>
              {isMilitary && (
                <View style={styles.discountLineItem}>
                  <Text style={styles.discountLineLabel}>Military Discount (3%)</Text>
                  <Text style={styles.discountLineValue}>-{formatCurrency(Math.round(grandTotal * 0.03))}</Text>
                </View>
              )}
              {payWithCheck && (
                <View style={styles.discountLineItem}>
                  <Text style={styles.discountLineLabel}>Cash/Check Discount (2%)</Text>
                  <Text style={styles.discountLineValue}>-{formatCurrency(Math.round(grandTotal * 0.02))}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.grandTotalBar}>
            <Text style={styles.grandTotalLabel}>Project Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
          </View>
        )}

        {/* Cash/Check Payment Section - Shown First */}
        {grandTotal > 0 && (
          <View style={styles.cashPaymentSection}>
            <View style={styles.cashPaymentHeader}>
              <Text style={styles.cashPaymentTitle}>Cash or Check Payment</Text>
              {hasDiscountsApplied && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    {payWithCheck && isMilitary ? 'SAVE 5%' : payWithCheck ? 'SAVE 2%' : 'SAVE 3%'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.cashPaymentGrid}>
              <View style={styles.cashPaymentOption}>
                <Text style={styles.cashPaymentLabel}>50% Deposit</Text>
                <Text style={styles.cashPaymentAmount}>{formatCurrency(halfDeposit)}</Text>
                <Text style={styles.cashPaymentNote}>Due at signing</Text>
              </View>
              <View style={styles.cashPaymentOption}>
                <Text style={styles.cashPaymentLabel}>50% Upon Completion</Text>
                <Text style={styles.cashPaymentAmount}>{formatCurrency(halfCompletion)}</Text>
                <Text style={styles.cashPaymentNote}>Due when job is complete</Text>
              </View>
            </View>

          </View>
        )}

        {/* Financing Options - Shown Below Cash */}
        {grandTotal > 0 && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>
              Financing Options (10% Down: {formatCurrency(Math.ceil(downPayment))})
            </Text>
            <View style={styles.paymentGrid}>
              <View style={styles.paymentOption}>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(Math.round(calculateMonthly(financeAmount, 0, 12)))}/mo
                </Text>
                <Text style={styles.paymentPeriod}>12 mo @ 0% APR</Text>
              </View>
              <View style={styles.paymentOption}>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(Math.round(calculateMonthly(financeAmount, 8.99, 48)))}/mo
                </Text>
                <Text style={styles.paymentPeriod}>48 mo @ 8.99%</Text>
              </View>
              <View style={styles.paymentOption}>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(Math.round(calculateMonthly(financeAmount, 9.99, 120)))}/mo
                </Text>
                <Text style={styles.paymentPeriod}>120 mo @ 9.99%</Text>
              </View>
            </View>
            {isMilitary && (
              <View style={styles.militaryDiscountNote}>
                <Text style={styles.militaryDiscountText}>
                  Military discount (3%) applied: -{formatCurrency(financeDiscountAmount)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer - No "valid for 30 days" */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>{today}</Text>
        </View>
      </Page>
    </Document>
  );
}
