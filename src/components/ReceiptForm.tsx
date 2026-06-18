/**
 * Receipt form component with master-detail tabs
 */
import React, { useState, useEffect } from 'react';
import { CaReceipt, CaReceiptDetail, ReceiptType, ReceiptStatus, RevenueType } from '../types';
import { indexedDBService } from '../services/indexedDB';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface ReceiptFormProps {
  receipt?: CaReceipt;
  onSave: (receipt: CaReceipt) => void;
  onCancel: () => void;
}

export default function ReceiptForm({ receipt, onSave, onCancel }: ReceiptFormProps) {
  const [formData, setFormData] = useState<Partial<CaReceipt>>({
    ca_receipt_no: '',
    ca_receipt_type: ReceiptType.RECEIPT,
    total_amount_receivable: 0,
    total_amount_receipt: 0,
    total_amount_debit: 0,
    ca_status: ReceiptStatus.PENDING,
    note: '',
    rowversion: 0
  });

  const [details, setDetails] = useState<CaReceiptDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receipt) {
      setFormData(receipt);
      loadReceiptDetails(receipt.ca_receipt_id);
    } else {
      // Generate new receipt number
      const newReceiptNo = `PT${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      setFormData(prev => ({
        ...prev,
        ca_receipt_no: newReceiptNo,
        ca_receipt_id: indexedDBService.generateId()
      }));
    }
  }, [receipt]);

  const loadReceiptDetails = async (receiptId: string) => {
    try {
      const receiptDetails = await indexedDBService.getReceiptDetails(receiptId);
      setDetails(receiptDetails);
    } catch (error) {
      console.error('Error loading receipt details:', error);
    }
  };

  const handleInputChange = (field: keyof CaReceipt, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (index: number, field: keyof CaReceiptDetail, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
    
    // Update totals
    updateTotals(newDetails);
  };

  const updateTotals = (detailList: CaReceiptDetail[]) => {
    const totalReceivable = detailList.reduce((sum, detail) => sum + detail.amount, 0);
    setFormData(prev => ({
      ...prev,
      total_amount_receivable: totalReceivable,
      total_amount_receipt: totalReceivable // Assuming receipt amount equals receivable
    }));
  };

  const addDetail = () => {
    const newDetail: CaReceiptDetail = {
      ca_receipt_detail_id: indexedDBService.generateId(),
      ca_receipt_id: formData.ca_receipt_id || '',
      ca_receipt_type: formData.ca_receipt_type || ReceiptType.RECEIPT,
      receipt_revenue: RevenueType.RENT,
      amount: 0,
      room_id: null,
      note: ''
    };
    setDetails([...details, newDetail]);
  };

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
    updateTotals(newDetails);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const receiptData: CaReceipt = {
        ca_receipt_id: formData.ca_receipt_id || indexedDBService.generateId(),
        ca_receipt_no: formData.ca_receipt_no || '',
        ca_receipt_type: formData.ca_receipt_type || ReceiptType.RECEIPT,
        total_amount_receivable: formData.total_amount_receivable || 0,
        total_amount_receipt: formData.total_amount_receipt || 0,
        total_amount_debit: formData.total_amount_debit || 0,
        ca_status: formData.ca_status || ReceiptStatus.PENDING,
        note: formData.note || '',
        rowversion: (formData.rowversion || 0) + 1
      };

      // Save receipt
      await indexedDBService.saveReceipt(receiptData);

      // Save details
      for (const detail of details) {
        const detailData: CaReceiptDetail = {
          ...detail,
          ca_receipt_id: receiptData.ca_receipt_id,
          ca_receipt_type: receiptData.ca_receipt_type
        };
        await indexedDBService.saveReceiptDetail(detailData);
      }

      onSave(receiptData);
    } catch (error) {
      console.error('Error saving receipt:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {receipt ? 'Cập nhật phiếu thu/chi' : 'Thêm mới phiếu thu/chi'}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save size={16} className="mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" onClick={onCancel} className="bg-transparent">
              <X size={16} className="mr-2" />
              Hủy
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin phiếu</TabsTrigger>
            <TabsTrigger value="details">Chi tiết phiếu</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiptNo">Số phiếu</Label>
                <Input
                  id="receiptNo"
                  value={formData.ca_receipt_no || ''}
                  onChange={(e) => handleInputChange('ca_receipt_no', e.target.value)}
                  placeholder="Nhập số phiếu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptType">Loại phiếu</Label>
                <Select
                  value={formData.ca_receipt_type?.toString() || '0'}
                  onValueChange={(value) => handleInputChange('ca_receipt_type', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phiếu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Phiếu thu</SelectItem>
                    <SelectItem value="1">Phiếu chi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalReceivable">Tổng cần thu/chi</Label>
                <Input
                  id="totalReceivable"
                  type="number"
                  value={formData.total_amount_receivable || 0}
                  onChange={(e) => handleInputChange('total_amount_receivable', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalReceipt">Tổng thực thu/chi</Label>
                <Input
                  id="totalReceipt"
                  type="number"
                  value={formData.total_amount_receipt || 0}
                  onChange={(e) => handleInputChange('total_amount_receipt', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalDebit">Tổng nợ</Label>
                <Input
                  id="totalDebit"
                  type="number"
                  value={formData.total_amount_debit || 0}
                  onChange={(e) => handleInputChange('total_amount_debit', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.ca_status?.toString() || '0'}
                  onValueChange={(value) => handleInputChange('ca_status', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Chưa thu/chi</SelectItem>
                    <SelectItem value="1">Đã thu/chi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                value={formData.note || ''}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Chi tiết phiếu</h3>
              <Button onClick={addDetail} variant="outline" className="bg-transparent">
                <Plus size={16} className="mr-2" />
                Thêm dòng
              </Button>
            </div>

            <div className="border rounded-lg">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-700">
                <div>Khoản thu/chi</div>
                <div>Số tiền</div>
                <div>Mã phòng</div>
                <div>Ghi chú</div>
                <div>Loại</div>
                <div>Thao tác</div>
              </div>

              {details.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Chưa có chi tiết nào. Nhấn "Thêm dòng" để bắt đầu.
                </div>
              ) : (
                details.map((detail, index) => (
                  <div key={detail.ca_receipt_detail_id} className="grid grid-cols-6 gap-4 p-4 border-t">
                    <Select
                      value={detail.receipt_revenue?.toString() || '0'}
                      onValueChange={(value) => handleDetailChange(index, 'receipt_revenue', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tiền nhà</SelectItem>
                        <SelectItem value="1">Tiền điện</SelectItem>
                        <SelectItem value="2">Tiền nước</SelectItem>
                        <SelectItem value="3">Khác</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={detail.amount || 0}
                      onChange={(e) => handleDetailChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />

                    <Input
                      value={detail.room_id || ''}
                      onChange={(e) => handleDetailChange(index, 'room_id', e.target.value)}
                      placeholder="Mã phòng"
                    />

                    <Input
                      value={detail.note || ''}
                      onChange={(e) => handleDetailChange(index, 'note', e.target.value)}
                      placeholder="Ghi chú"
                    />

                    <Badge variant="outline">
                      {getRevenueTypeText(detail.receipt_revenue || RevenueType.RENT)}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDetail(index)}
                      className="bg-transparent text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

