const PDFDocument = require('pdfkit');

function generatePayslipPDF(payslip, employee, contract, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream PDF to HTTP response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e3a8a'; // Deep Navy
  const secondaryColor = '#3b82f6'; // Bright Blue
  const darkText = '#1f2937';
  const lightBg = '#f3f4f6';

  // --- HEADER SECTION ---
  doc
    .rect(40, 40, 515, 60)
    .fill(primaryColor);

  doc
    .fillColor('#ffffff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('PEOPLEPAY360', 55, 52);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('INTEGRATED HR & PAYROLL MANAGEMENT SYSTEM', 55, 78);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SALARY PAYSLIP', 430, 62, { align: 'right' });

  // --- EMPLOYEE & PERIOD DETAILS CARD ---
  let y = 115;
  doc
    .rect(40, y, 515, 95)
    .fillAndStroke(lightBg, '#e5e7eb');

  doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold');

  // Left Column
  doc.text('Employee Name:', 55, y + 12);
  doc.font('Helvetica').text(`${employee.firstName} ${employee.lastName}`, 155, y + 12);

  doc.font('Helvetica-Bold').text('Employee ID:', 55, y + 30);
  doc.font('Helvetica').text(employee.employeeId || 'N/A', 155, y + 30);

  doc.font('Helvetica-Bold').text('Department:', 55, y + 48);
  doc.font('Helvetica').text(employee.department ? employee.department.name : 'General', 155, y + 48);

  doc.font('Helvetica-Bold').text('Job Title:', 55, y + 66);
  doc.font('Helvetica').text(employee.jobPosition ? employee.jobPosition.title : 'Staff', 155, y + 66);

  // Right Column
  doc.font('Helvetica-Bold').text('Pay Period:', 320, y + 12);
  const pStart = new Date(payslip.periodStart).toLocaleDateString('en-IN');
  const pEnd = new Date(payslip.periodEnd).toLocaleDateString('en-IN');
  doc.font('Helvetica').text(`${pStart} - ${pEnd}`, 410, y + 12);

  doc.font('Helvetica-Bold').text('Base Wage:', 320, y + 30);
  doc.font('Helvetica').text(`₹ ${contract ? contract.wage.toLocaleString('en-IN') : 0}`, 410, y + 30);

  doc.font('Helvetica-Bold').text('Worked Days:', 320, y + 48);
  doc.font('Helvetica').text(`${payslip.workedDays || 0} Days`, 410, y + 48);

  doc.font('Helvetica-Bold').text('Payment Status:', 320, y + 66);
  doc
    .font('Helvetica-Bold')
    .fillColor(payslip.status === 'PAID' ? '#16a34a' : '#d97706')
    .text(payslip.status, 410, y + 66);

  // --- EARNINGS & DEDUCTIONS TABLE ---
  y += 115;

  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('SALARY BREAKDOWN', 40, y);
  y += 20;

  // Table Header
  doc.rect(40, y, 515, 24).fill(primaryColor);
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
  doc.text('Component Rule', 55, y + 7);
  doc.text('Category', 280, y + 7);
  doc.text('Amount (₹)', 450, y + 7, { align: 'right' });
  y += 24;

  // Table Rows
  let isEven = false;
  payslip.lineItems.forEach((item) => {
    doc.rect(40, y, 515, 22).fill(isEven ? '#f9fafb' : '#ffffff');
    isEven = !isEven;

    doc.fillColor(darkText).fontSize(9).font('Helvetica');
    doc.text(item.name, 55, y + 6);
    doc.text(item.category, 280, y + 6);

    const amtStr = `₹ ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (item.category === 'DEDUCTION') {
      doc.fillColor('#dc2626').text(`- ${amtStr}`, 450, y + 6, { align: 'right' });
    } else {
      doc.fillColor('#16a34a').text(amtStr, 450, y + 6, { align: 'right' });
    }
    y += 22;
  });

  // --- SUMMARY TOTALS SECTION ---
  y += 15;
  doc.rect(40, y, 515, 55).fillAndStroke('#f8fafc', '#cbd5e1');

  doc.fillColor(darkText).fontSize(10).font('Helvetica-Bold');
  doc.text('Gross Earnings:', 55, y + 12);
  doc.fillColor('#16a34a').text(`₹ ${payslip.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 170, y + 12);

  doc.fillColor(darkText).text('Total Deductions:', 55, y + 32);
  doc.fillColor('#dc2626').text(`₹ ${payslip.totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 170, y + 32);

  doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold');
  doc.text('NET SALARY PAID:', 300, y + 20);
  doc.fillColor('#16a34a').text(`₹ ${payslip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 440, y + 20, { align: 'right' });

  // --- FOOTER SECTION ---
  y = 750;
  doc
    .fontSize(8)
    .fillColor('#9ca3af')
    .text('This is a computer-generated document processed by PeoplePay360 Integrated HR & Payroll Engine.', 40, y, { align: 'center' });

  doc.end();
}

module.exports = { generatePayslipPDF };
