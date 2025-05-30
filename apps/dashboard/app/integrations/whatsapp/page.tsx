"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

export default function WhatsAppIntegrationPage() {
  const [qrCode, setQrCode] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar QR Code da Evolution API
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const response = await fetch('/api/integrations/whatsapp/qr');
      const data = await response.json();
      
      if (data.connected) {
        setConnected(true);
      } else {
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error);
    } finally {
      setLoading(false);
    }
  };

  const deployEvolutionAPI = () => {
    // Abrir Railway template
    window.open('https://railway.app/new/template/LK1WXD', '_blank');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integração WhatsApp</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Conecte seu WhatsApp Business para começar a atender clientes automaticamente
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : connected ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-semibold mb-2">WhatsApp Conectado!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Seu agente está pronto para atender no WhatsApp
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">
                Escaneie o QR Code com seu WhatsApp
              </h2>
              {qrCode ? (
                <div className="inline-block p-4 bg-white rounded-lg">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Primeiro, você precisa configurar a Evolution API
                  </p>
                  <button
                    onClick={deployEvolutionAPI}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Deploy Evolution API no Railway
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Instruções:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Vá em Configurações → Dispositivos conectados</li>
                <li>Clique em "Conectar dispositivo"</li>
                <li>Escaneie o QR Code acima</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Recursos Evolution API:</h3>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• Multi-dispositivo e multi-sessão</li>
          <li>• Webhooks em tempo real</li>
          <li>• Envio de mídia (imagens, vídeos, documentos)</li>
          <li>• Grupos e broadcasts</li>
          <li>• Template messages</li>
        </ul>
      </div>
    </div>
  );
}
