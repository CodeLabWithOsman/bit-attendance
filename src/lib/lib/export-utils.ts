import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface AttendanceRecord {
  name: string;
  index: string;
  timestamp?: string;
  status: 'Present' | 'Absent';
}

export function exportToPDF(records: AttendanceRecord[], title: string = 'Attendance Report') {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableData = records.map((r) => [
    r.name,
    r.index,
    r.status,
    r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : 'N/A',
  ]);
  
  autoTable(doc, {
    head: [['Name', 'Index', 'Status', 'Time']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`attendance-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToExcel(records: AttendanceRecord[], title: string = 'Attendance Report') {
  const wsData = [
    [title],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    ['Name', 'Index', 'Status', 'Time'],
    ...records.map((r) => [
      r.name,
      r.index,
      r.status,
      r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A',
    ]),
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  
  XLSX.writeFile(wb, `attendance-${new Date().toISOString().split('T')[0]}.xlsx`);
}
