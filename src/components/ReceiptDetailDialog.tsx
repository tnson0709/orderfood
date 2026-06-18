
/**
 * Receipt detail dialog component for viewing receipt information
 */
import React, { useState, useEffect } from 'react';
import { CaReceipt, CaReceiptDetail, ReceiptType, ReceiptStatus, RevenueType } from '../types';
import { indexedDBService } from '../services/indexedDB';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, Edit, Copy, Printer } from 'lucide-react';

interface ReceiptDetailDialogProps {
  receipt: CaReceipt | null;
  open: boolean;
  onClose: () => void;
  onEdit: (receipt: CaReceipt) => void;
  onDuplicate: (receipt: CaReceipt) => void;
  onPrint: (receipt: CaReceipt) => void;
}

export default function ReceiptDetailDialog({
  receipt,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onPrint
}: ReceiptDetailDialogProps) {
  const [details, setDetails] = useState<CaReceiptDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receipt && open) {
      loadReceiptDetails(receipt.ca_receipt_id);
    }
  }, [receipt, open]);

  const loadReceiptDetails = async (receiptId: string) => {
    setLoading(true);
    try {
      const receiptDetails = await indexedDBService.getReceiptDetails(receiptId);
      setDetails(receiptDetails);
    } catch (error) {
      console.error('Error loading receipt details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReceiptTypeText = (type: ReceiptType) => {
    return type === ReceiptType.RECEIPT ? 'Phiếu thu' : 'Phiếu chi';
  };

  const getReceiptTypeColor = (type: ReceiptType) => {
    return type === ReceiptType.RECEIPT 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: ReceiptStatus) => {
    return status === ReceiptStatus.PENDING ? 'Chưa thu/chi' : 'Đã thu/chi';
  };

  const getStatusColor = (status: ReceiptStatus) => {
    return status === ReceiptStatus.PENDING 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-green-100 text-green-800';
  };

  const getRevenueTypeText = (type: RevenueType) => {
    switch (type) {
      case RevenueType.RENT: return 'Tiền nhà';
      case RevenueType.ELECTRICITY: return 'Tiền điện';
      case RevenueType.WATER: return 'Tiền nước';
      case RevenueType.OTHER: return 'Khác';
      default: return 'Không xác định';
    }
  };

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Chi tiết phiếu {getReceiptTypeText(receipt.ca_receipt_type)}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(receipt)}
              className="bg-transparent"
            >
              <Edit size={16} className="mr-2" />
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(receipt)}
              className="bg-transparent"
            >
              <Copy size={16} className="mr-2" />
              Nhân bản
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(receipt)}
              className="bg-transparent"
            >
              <Printer size={16} className="mr-2" />
              In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-transparent"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="info" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Thông tin phiếu</TabsTrigger>
              <TabsTrigger value="details">Chi tiết phiếu</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số phiếu:</span>
                      <span className="text-sm font-medium">{receipt.ca_receipt_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Loại phiếu:</span>
                      <Badge className={getReceiptTypeColor(receipt.ca_receipt_type)}>
                        {getReceiptTypeText(receipt.ca_receipt_type)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <Badge className={getStatusColor(receipt.ca_status)}>
                        {getStatusText(receipt.ca_status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Thông tin số tiền</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng cần thu/chi:</span>
                      <span className="text-sm font-medium">
                        {receipt.total_amount_receivable.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng thực thu/chi:</span>
                      <span className="text-sm font-medium">
                        {receipt.total_amount_receipt.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tổng nợ:</span>
                      <span className="text-sm font-medium">
                        {receipt.total_amount_debit.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    {receipt.note || 'Không có ghi chú'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Chi tiết phiếu</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Đang tải chi tiết...
                    </div>
                  ) : details.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Không có chi tiết nào
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm text-gray-700 rounded">
                        <div>Khoản thu/chi</div>
                        <div>Số tiền</div>
                        <div>Mã phòng</div>
                        <div>Ghi chú</div>
                        <div>Loại</div>
                      </div>
                      {details.map((detail) => (
                        <div key={detail.ca_receipt_detail_id} className="grid grid-cols-5 gap-4 p-3 border rounded">
                          <div className="text-sm">{getRevenueTypeText(detail.receipt_revenue)}</div>
                          <div className="text-sm font-medium">
                            {detail.amount.toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-sm">{detail.room_id || '-'}</div>
                          <div className="text-sm text-gray-600">{detail.note || '-'}</div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {getRevenueTypeText(detail.receipt_revenue)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
