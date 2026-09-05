const PDFDocument = require('pdfkit');

function generatePayslipPDF(payslip, employee, contract, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream PDF to HTTP response
  doc.pipe(res);

  // Styling Palette
  const primaryColor = '#0f172a'; // Slate 900
  const accentBlue = '#4338ca'; // Indigo 700
  const darkText = '#1e293b'; // Slate 800
  const mutedText = '#64748b'; // Slate 500
  const borderStroke = '#cbd5e1'; // Slate 300
  const lightBg = '#f8fafc'; // Slate 50

  const marginX = 40;
  const contentWidth = 515;

  // --- 1. HEADER SECTION ---
  doc
    .rect(marginX, 40, contentWidth, 65)
    .fillAndStroke(primaryColor, primaryColor);

  doc
    .fillColor('#ffffff')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('PEOPLEPAY360', marginX + 15, 52);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text('INTEGRATED HR & PAYROLL MANAGEMENT PLATFORM', marginX + 15, 77);

  doc
    .fillColor('#ffffff')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SALARY PAYSLIP', marginX, 62, { width: contentWidth - 15, align: 'right' });

  // --- 2. EMPLOYEE & PERIOD DETAILS CARD ---
  let y = 115;
  doc
    .rect(marginX, y, contentWidth, 100)
    .fillAndStroke(lightBg, borderStroke);

  doc.fillColor(darkText).fontSize(9);

  // Column 1
  doc.font('Helvetica-Bold').text('Employee Name:', marginX + 15, y + 12);
  doc.font('Helvetica').text(`${employee.firstName} ${employee.lastName}`, marginX + 105, y + 12);

  doc.font('Helvetica-Bold').text('Employee ID:', marginX + 15, y + 32);
  doc.font('Helvetica').text(employee.employeeId || 'N/A', marginX + 105, y + 32);

  doc.font('Helvetica-Bold').text('Department:', marginX + 15, y + 52);
  doc.font('Helvetica').text(employee.department ? employee.department.name : 'General', marginX + 105, y + 52);

  doc.font('Helvetica-Bold').text('Job Title:', marginX + 15, y + 72);
  doc.font('Helvetica').text(employee.jobPosition ? employee.jobPosition.title : 'Staff', marginX + 105, y + 72);

  // Vertical Separator Line
  doc
    .moveTo(marginX + 260, y + 10)
    .lineTo(marginX + 260, y + 90)
    .stroke(borderStroke);

  // Column 2
  doc.font('Helvetica-Bold').text('Pay Period:', marginX + 275, y + 12);
  const pStart = new Date(payslip.periodStart).toLocaleDateString('en-IN');
  const pEnd = new Date(payslip.periodEnd).toLocaleDateString('en-IN');
  doc.font('Helvetica').text(`${pStart} - ${pEnd}`, marginX + 365, y + 12);

  doc.font('Helvetica-Bold').text('Base Wage:', marginX + 275, y + 32);
  doc.font('Helvetica').text(`INR ${contract ? contract.wage.toLocaleString('en-IN') : 0}`, marginX + 365, y + 32);

  doc.font('Helvetica-Bold').text('Worked Days:', marginX + 275, y + 52);
  doc.font('Helvetica').text(`${payslip.workedDays || 0} Days`, marginX + 365, y + 52);

  doc.font('Helvetica-Bold').text('Payment Status:', marginX + 275, y + 72);
  doc
    .font('Helvetica-Bold')
    .fillColor(payslip.status === 'PAID' ? '#16a34a' : '#d97706')
    .text(payslip.status, marginX + 365, y + 72);

  // --- 3. SALARY BREAKDOWN TABLE ---
  y += 118;

  doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('SALARY BREAKDOWN', marginX, y);
  y += 18;

  // Table Header Box
  doc.rect(marginX, y, contentWidth, 24).fillAndStroke(accentBlue, accentBlue);
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  doc.text('Component Rule', marginX + 15, y + 7);
  doc.text('Category', marginX + 270, y + 7);
  doc.text('Amount (INR)', marginX + 360, y + 7, { width: 140, align: 'right' });
  y += 24;

  // Table Rows with Crisp Borders
  let isEven = false;
  payslip.lineItems.forEach((item) => {
    // Row Box & Border
    doc
      .rect(marginX, y, contentWidth, 22)
      .fillAndStroke(isEven ? '#f8fafc' : '#ffffff', borderStroke);
    isEven = !isEven;

    doc.fillColor(darkText).fontSize(9).font('Helvetica');
    doc.text(item.name, marginX + 15, y + 6);
    doc.text(item.category, marginX + 270, y + 6);

    const amtStr = `INR ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (item.category === 'DEDUCTION') {
      doc.fillColor('#dc2626').font('Helvetica-Bold').text(`- ${amtStr}`, marginX + 360, y + 6, { width: 140, align: 'right' });
    } else {
      doc.fillColor('#16a34a').font('Helvetica-Bold').text(amtStr, marginX + 360, y + 6, { width: 140, align: 'right' });
    }
    y += 22;
  });

  // --- 4. SUMMARY TOTALS SECTION CARD ---
  y += 15;
  doc
    .rect(marginX, y, contentWidth, 60)
    .fillAndStroke('#f1f5f9', borderStroke);

  // Left Summary Totals
  doc.fillColor(darkText).fontSize(9).font('Helvetica-Bold');
  doc.text('Gross Earnings:', marginX + 15, y + 14);
  doc.fillColor('#16a34a').text(`INR ${payslip.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, marginX + 120, y + 14);

  doc.fillColor(darkText).text('Total Deductions:', marginX + 15, y + 34);
  doc.fillColor('#dc2626').text(`INR ${payslip.totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, marginX + 120, y + 34);

  // Right Net Salary Box
  doc
    .rect(marginX + 260, y + 8, 245, 44)
    .fillAndStroke('#1e1b4b', '#1e1b4b');

  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica-Bold');
  doc.text('NET SALARY PAID', marginX + 270, y + 16);
  doc
    .fillColor('#38bdf8')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`INR ${payslip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, marginX + 270, y + 30, { width: 225, align: 'right' });

  // --- 5. FOOTER SECTION ---
  y = 750;
  doc
    .rect(marginX, y - 10, contentWidth, 1)
    .fill(borderStroke);

  doc
    .fontSize(8)
    .fillColor(mutedText)
    .font('Helvetica')
    .text('This is an official computer-generated salary payslip processed by PeoplePay360 HR & Payroll Engine.', marginX, y + 5, { width: contentWidth, align: 'center' });

  doc.end();
}

module.exports = { generatePayslipPDF };
