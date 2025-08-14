import QRCode from 'qrcode';

export const generateQRCode = async (text: string, size: number = 200): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateTrialQRCode = async (trial: Trial): Promise<string> => {
  const reportUrl = `${window.location.origin}/trial/${trial.id}/report`;
  return generateQRCode(reportUrl);
};