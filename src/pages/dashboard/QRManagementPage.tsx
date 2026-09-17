import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { QrCode, Download, Copy, ExternalLink, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { Card, Button } from '@/components/ui';
import type { Business } from '@/lib/types';

export function QRManagementPage() {
  const { business } = useOutletContext<{ business: Business | null }>();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [copied, setCopied] = useState(false);

  const reviewUrl = business ? `${window.location.origin}/r/${business.slug}` : '';

  useEffect(() => {
    if (!reviewUrl) return;
    QRCode.toDataURL(reviewUrl, { width: 600, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error);
    QRCode.toString(reviewUrl, { type: 'svg', margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
      .then(setQrSvg)
      .catch(console.error);
  }, [reviewUrl]);

  function copyUrl() {
    navigator.clipboard.writeText(reviewUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadSvg() {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${business?.slug ?? 'reviewflow'}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!business) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
      <p className="mt-1 text-sm text-gray-500">Display this at your counter for customers to scan.</p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* QR preview */}
        <Card className="p-8 flex flex-col items-center">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <a href={qrDataUrl} download={`${business.slug}-qr.png`} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" /> PNG
            </a>
            <Button variant="outline" onClick={downloadSvg} disabled={!qrSvg}>
              <Download className="h-4 w-4" /> SVG
            </Button>
            <Button variant="outline" onClick={copyUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </Button>
            <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
          </div>
          <div className="mt-4 text-xs text-gray-400 break-all text-center max-w-xs">{reviewUrl}</div>
        </Card>

        {/* Printable card preview */}
        <Card className="p-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Printable Counter Card</h2>
          <div className="rounded-2xl border-2 border-gray-200 p-8 text-center bg-gradient-to-br from-blue-50 to-white">
            {business.logo_url && (
              <img src={business.logo_url} alt={business.name} className="h-16 w-16 rounded-xl object-cover mx-auto mb-3" />
            )}
            <h3 className="text-lg font-bold text-gray-900">{business.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Share your experience</p>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-40 h-40 mx-auto mt-4 rounded-xl" />}
            <p className="text-xs text-gray-400 mt-3">Scan to write a review</p>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Print this card and place it at your cash counter, reception desk, or billing area.
          </p>
        </Card>
      </div>
    </div>
  );
}
