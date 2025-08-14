import jsPDF from 'jspdf';
import { Trial, DEPARTMENTS } from '../types/trial';

export const generateTrialPDF = (trial: Trial): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NPD Trial Report', margin, yPosition);
  yPosition += 15;

  // Trial Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Trial No: ${trial.trialNo}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Part Name: ${trial.partName}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Status: ${trial.status.toUpperCase().replace('_', ' ')}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Created: ${new Date(trial.createdAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Updated: ${new Date(trial.updatedAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Department Data
  DEPARTMENTS.forEach(department => {
    const stepData = trial.steps.find(s => s.stepCode === department.code);
    
    checkPageBreak(30);
    
    // Department Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(department.name, margin, yPosition);
    yPosition += 10;
    
    if (stepData) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Status
      const statusText = `Status: ${stepData.validationStatus.toUpperCase().replace('_', ' ')}`;
      doc.text(statusText, margin, yPosition);
      yPosition += 8;
      
      // Fields
      department.fields.forEach(field => {
        checkPageBreak(8);
        const value = stepData.data[field.name];
        const displayValue = value !== undefined && value !== null && value !== '' ? value : 'Not specified';
        doc.text(`${field.label}: ${displayValue}`, margin, yPosition);
        yPosition += 6;
      });
      
      // Remarks
      if (stepData.remarks) {
        checkPageBreak(12);
        doc.text('Remarks:', margin, yPosition);
        yPosition += 6;
        const remarks = stepData.remarks.toString();
        const splitRemarks = doc.splitTextToSize(remarks, 170);
        doc.text(splitRemarks, margin + 5, yPosition);
        yPosition += splitRemarks.length * 6;
      }
      
      // Completion time
      if (stepData.completedAt) {
        checkPageBreak(8);
        doc.text(`Completed: ${new Date(stepData.completedAt).toLocaleString()}`, margin, yPosition);
        yPosition += 8;
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Not started', margin, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;
  });

  return doc;
};

export const downloadTrialPDF = (trial: Trial) => {
  const doc = generateTrialPDF(trial);
  doc.save(`Trial_${trial.trialNo}_Report.pdf`);
};