// src/lib/generatePDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ShiftData {
  day: number;
  std: number; // Horas normais
  nacht: number; // Horas noturnas
  bonus: number; // Bónus (ex: 10%)
  total: number;
}

export function generateEmployeeReport(
  employeeName: string, 
  monthName: string, 
  year: string,
  shifts: ShiftData[], 
  summary: { total: number, target: number, balance: number }
) {
  const doc = new jsPDF();

  // Cabeçalho Principal[cite: 2]
  doc.setFontSize(12);
  doc.text(`Jahr: ${year} ${monthName}`, 14, 15);
  doc.text('Arbeitsstunden', 14, 22);
  doc.text(employeeName.toUpperCase(), 150, 22);

  // Preparar dados da tabela (1 a 31 dias)
  const tableData = [];
  let totalStd = 0, totalNacht = 0, totalBonus = 0, totalGeral = 0;

  for (let i = 1; i <= 31; i++) {
    const shift = shifts.find(s => s.day === i);
    if (shift) {
      tableData.push([
        i.toString(), 
        shift.std.toFixed(2), 
        shift.nacht > 0 ? shift.nacht.toFixed(2) : '', 
        shift.bonus > 0 ? shift.bonus.toFixed(2) : '', 
        shift.total.toFixed(2)
      ]);
      totalStd += shift.std;
      totalNacht += shift.nacht;
      totalBonus += shift.bonus;
      totalGeral += shift.total;
    } else {
      tableData.push([i.toString(), '', '', '', '']); // Linhas vazias para dias sem turno
    }
  }

  // Adicionar linha de total do mês[cite: 2]
  tableData.push(['', '', '', '', totalGeral.toFixed(2)]);

  // Gerar a Tabela Principal
  autoTable(doc, {
    startY: 30,
    head: [['Mt.\n' + monthName, 'Std.', 'Nacht\n0.10', '10%', 'Total\nTg-Std.']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1, halign: 'center' },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
  });

  // Tabela de Resumo (Stundenkonto) na parte inferior[cite: 2]
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.text('Stundenkonto', 14, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    head: [['', 'Total Std.', 'soll', 'saldo', 'Ferien', 'Krank']],
    body: [
      [monthName, totalGeral.toFixed(2), summary.target.toString(), summary.balance.toFixed(2), '0', '0'],
      ['saldo', '', '', summary.balance.toFixed(2), '', '']
    ],
    theme: 'grid',
    styles: { fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [220, 220, 220], textColor: 0 }
  });

  // Gravar PDF
  doc.save(`Arbeitsstunden_${employeeName}_${monthName}_${year}.pdf`);
}