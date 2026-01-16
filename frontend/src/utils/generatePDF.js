import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarComprobantePDF = (orden) => {
  const doc = jsPDF();
  const fecha = new Date().toLocaleDateString();

  // Encabezado - Estilo Lics Soluciones
  doc.setFillColor(37, 99, 235); // Azul primario
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('LICS SOLUCIONES', 15, 25);
  
  doc.setFontSize(10);
  doc.text('Servicio Técnico Especializado', 15, 32);
  doc.text(`Fecha: ${fecha}`, 160, 25);

  // Información de la Orden
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`ORDEN DE TRABAJO: #${orden.id}`, 15, 55);
  
  // Tabla de Detalles
  doc.autoTable({
    startY: 65,
    head: [['Campo', 'Detalle']],
    body: [
      ['Cliente', orden.cliente_nombre],
      ['Equipo', `${orden.equipo_tipo} - ${orden.equipo_marca}`],
      ['Falla Reportada', orden.falla],
      ['Técnico Asignado', orden.tecnico_nombre],
      ['Estado Actual', orden.estado.toUpperCase()],
      ['Presupuesto/Costo', `$${orden.costo || 'Pendiente'}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] }
  });

  // Términos y Condiciones
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.text('Nota: El equipo debe ser retirado en un plazo máximo de 30 días.', 15, finalY);
  doc.text('Firma del Cliente: _______________________', 15, finalY + 20);

  // Descargar
  doc.save(`Orden_${orden.id}_LicsSoluciones.pdf`);
};