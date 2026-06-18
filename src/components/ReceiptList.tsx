/**
 * Receipt list component with filtering, pagination, and context menu
 */
import React, { useState, useEffect } from 'react';
import { CaReceipt, ReceiptType, ReceiptStatus, ContextMenuItem, PaginationOptions } from '../types';
import { indexedDBService } from '../services/indexedDB';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ContextMenu from './ui/ContextMenu';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Printer, 
  FileDown, 
  FileUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ReceiptListProps {
  onAdd: () => void;
  onEdit: (receipt: CaReceipt) => void;
  onDuplicate: (receipt: CaReceipt) => void;
  onDelete: (receipt: CaReceipt) => void;
  onPrint: (receipt: CaReceipt) => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onViewDetail: (receipt: CaReceipt) => void;
}

export default function ReceiptList({
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
  onPrint,
  onRefresh,
  onExportExcel,
  onImportExcel,
  onViewDetail
}: ReceiptListProps) {
  const [receipts, setReceipts] = useState<CaReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptTypeFilter, setReceiptTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const filter: any = {};
      if (receiptTypeFilter !== '' && receiptTypeFilter !== 'all') {
        filter.receiptType = parseInt(receiptTypeFilter);
      }
      if (statusFilter !== '' && statusFilter !== 'all') {
        filter.status = parseInt(statusFilter);
      }
      if (searchTerm) {
        filter.search = searchTerm;
      }

      const result = await indexedDBService.getReceipts(
        pagination.page,
        pagination.pageSize,
        filter
      );
      
      setReceipts(result.receipts);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [pagination.page, pagination.pageSize, receiptTypeFilter, statusFilter, searchTerm]);

  const getContextItems = (receipt: CaReceipt): ContextMenuItem[] => [
    {
      id: 'duplicate',
      label: 'Nhân bản',
      icon: 'copy',
      action: () => onDuplicate(receipt)
    },
    {
      id: 'refresh',
      label: 'Nạp',
      icon: 'refresh-cw',
      action: () => onRefresh()
    },
    {
      id: 'print',
      label: 'In',
      icon: 'printer',
      action: () => onPrint(receipt)
    },
    {
      id: 'export',
      label: 'Xuất khẩu Excel',
      icon: 'file-down',
      action: () => onExportExcel()
    },
    {
      id: 'import',
      label: 'Nhập khẩu Excel',
      icon: 'file-up',
      action: () => onImportExcel()
    }
  ];

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusText = (status: ReceiptStatus) => {
    return status === ReceiptStatus.PENDING ? 'Chưa thu/chi' : 'Đã thu/chi';
  };

  const getStatusColor = (status: ReceiptStatus) => {
    return status === ReceiptStatus.PENDING 
      ? 'bg-yellow-100 text-yellow-800' 
      : 'bg-green-100 text-green-800';
  };

  const getReceiptTypeText = (type: ReceiptType) => {
    return type === ReceiptType.RECEIPT ? 'Phiếu thu' : 'Phiếu chi';
  };

  const getReceiptTypeColor = (type: ReceiptType) => {
    return type === ReceiptType.RECEIPT 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách phiếu thu/chi</h2>
          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus size={16} />
            Thêm mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Tìm kiếm theo số phiếu hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={receiptTypeFilter || "all"} onValueChange={setReceiptTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Loại phiếu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="0">Phiếu thu</SelectItem>
              <SelectItem value="1">Phiếu chi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="0">Chưa thu/chi</SelectItem>
              <SelectItem value="1">Đã thu/chi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số phiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại phiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng cần thu/chi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng thực thu/chi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <ContextMenu
                  key={receipt.ca_receipt_id}
                  items={getContextItems(receipt)}
                  trigger="right-click"
                >
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewDetail(receipt)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.ca_receipt_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReceiptTypeColor(receipt.ca_receipt_type)}`}>
                        {getReceiptTypeText(receipt.ca_receipt_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.total_amount_receivable.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.total_amount_receipt.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(receipt.ca_status)}`}>
                        {getStatusText(receipt.ca_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {receipt.note}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(receipt);
                          }}
                          className="bg-transparent"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(receipt);
                          }}
                          className="bg-transparent text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </ContextMenu>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> đến{' '}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
          </span>{' '}
          trong <span className="font-medium">{pagination.total}</span> kết quả
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="bg-transparent"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-gray-700">
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            className="bg-transparent"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div>
          <table className="w-full">
          </table>
      </div>
      
    </div>
  );
}
