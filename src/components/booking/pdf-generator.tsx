'use client';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Download } from 'lucide-react';

interface PDFGeneratorProps {
  appointment: {
    clientName: string;
    artistName: string;
    dateTime: string;
    style: string;
    size: string;
    placement: string;
    depositAmount: number;
  };
}

export function PDFGenerator({ appointment }: PDFGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text('Booking Confirmation', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Test Ink Tattoo Studio', 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);

    // Appointment Details
    doc.setFontSize(16);
    doc.text('Appointment Details', 20, 50);

    const details = [
      ['Client Name', appointment.clientName],
      ['Artist', appointment.artistName],
      ['Date & Time', appointment.dateTime],
      ['Tattoo Style', appointment.style],
      ['Size', appointment.size],
      ['Placement', appointment.placement],
      ['Deposit Paid', `$${(appointment.depositAmount / 100).toFixed(2)}`],
    ];

    (doc as any).autoTable({
      startY: 55,
      head: [['Field', 'Details']],
      body: details,
      theme: 'striped',
      headStyles: { fillStyle: [0, 0, 0] },
    });

    // Aftercare Instructions
    const finalY = (doc as any).lastAutoTable.cursor.y + 20;
    doc.setFontSize(16);
    doc.text('Aftercare Instructions', 20, finalY);

    doc.setFontSize(10);
    const instructions = [
      '1. Keep the bandage on for 2-4 hours.',
      '2. Wash your hands before touching your tattoo.',
      '3. Gently wash the tattoo with unscented antibacterial soap and lukewarm water.',
      '4. Pat dry with a clean paper towel. Do not rub.',
      '5. Apply a very thin layer of recommended aftercare ointment.',
      '6. Repeat cleaning and moisturizing 2-3 times a day for 2 weeks.',
      '7. Do not pick or scratch the tattoo.',
      '8. Avoid direct sunlight, swimming, and soaking for 2-3 weeks.',
    ];

    let yPos = finalY + 10;
    instructions.forEach((line) => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });

    // Footer
    doc.setFontSize(10);
    doc.text('If you have any questions, please contact us at hello@testink.com', 105, 280, { align: 'center' });

    doc.save(`booking-confirmation-${appointment.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-100 text-zinc-900 rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
    >
      <Download size={20} />
      Download Confirmation PDF
    </button>
  );
}
