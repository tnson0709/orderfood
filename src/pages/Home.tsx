/**
 * Home page - Main application interface
 */
import React, { useState, useEffect } from 'react';
import { CaReceipt } from '../types';
import { indexedDBService } from '../services/indexedDB';
import ReceiptList from '../components/ReceiptList';
import ReceiptForm from '../components/ReceiptForm';
import ReceiptDetailDialog from '../components/ReceiptDetailDialog';
//import SplitPane from '../components/ui/SplitPane';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  FileText, 
  Settings, 
  BarChart3, 
  Users,
  Menu,
  ShoppingCart,
} from 'lucide-react';
import { OrderList } from '@/components/orders/OrderList';
import OrderInfoPage from './OrderInfo';

type ViewMode = 'receiptlist' | 'form' | 'dashboard'| 'orderinfo';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('receiptlist');
  const [selectedReceipt, setSelectedReceipt] = useState<CaReceipt | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<CaReceipt | null>(null);

  useEffect(() => {
    // Initialize IndexedDB
    indexedDBService.init();
  }, []);

  const handleAdd = () => {
    setSelectedReceipt(undefined);
    setViewMode('form');  
   
  };

  const handleEdit = (receipt: CaReceipt) => {
    setSelectedReceipt(receipt);
    setViewMode('form');
    setDetailDialogOpen(false);
  };

  const handleDuplicate = (receipt: CaReceipt) => {
    const duplicatedReceipt = {
      ...receipt,
      ca_receipt_id: indexedDBService.generateId(),
      ca_receipt_no: `${receipt.ca_receipt_no}_COPY`,
      rowversion: 0
    };
    setSelectedReceipt(duplicatedReceipt);
    setViewMode('form');
    setDetailDialogOpen(false);
  };

  const handleDelete = async (receipt: CaReceipt) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu này?')) {
      try {
        await indexedDBService.deleteReceipt(receipt.ca_receipt_id);
        await indexedDBService.deleteReceiptDetails(receipt.ca_receipt_id);
        // Refresh would happen automatically through state update
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const handleSave = (receipt: CaReceipt) => {
    setViewMode('receiptlist');
    setSelectedReceipt(undefined);
  };

  const handleCancel = () => {
    setViewMode('receiptlist');
    setSelectedReceipt(undefined);
  };

  const handlePrint = (receipt: CaReceipt) => {
    window.print();
  };

  const handleRefresh = () => {
    // Refresh logic would be implemented here
    window.location.reload();
  };

  const handleExportExcel = () => {
    // Excel export logic would be implemented here
    alert('Xuất Excel - Chức năng đang phát triển');
  };

  const handleImportExcel = () => {
    // Excel import logic would be implemented here
    alert('Nhập Excel - Chức năng đang phát triển');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'form':
        return (
          <ReceiptForm
            receipt={selectedReceipt}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case'orderinfo':
          return (
          <OrderInfoPage            
            
          />
        );
      case 'dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng phiếu thu</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng phiếu chi</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 đ</div>
                  <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 đ</div>
                  <p className="text-xs text-muted-foreground">+0% so với tháng trước</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <ReceiptList
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onPrint={handlePrint}
            onRefresh={handleRefresh}
            onExportExcel={handleExportExcel}
            onImportExcel={handleImportExcel}
            onViewDetail={(receipt) => {
              setViewingReceipt(receipt);
              setDetailDialogOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Quản lý thu/chi</h1>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button
                variant={viewMode === 'receiptlist' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setViewMode('receiptlist')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Danh sách phiếu
              </Button>

              <Button
                variant={viewMode === 'orderinfo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setViewMode('orderinfo')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Danh sách đơn
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { window.location.hash = "/orderfood" }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Đặt nhanh
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => { window.location.hash = "/foodadmin" }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Quản lý sản phẩm
              </Button>
              
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setViewMode('dashboard')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Tổng quan
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setViewMode('orderinfo')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-transparent"
              >
                <Menu size={16} />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {viewMode === 'receiptlist' && 'Danh sách phiếu thu/chi'}
                {viewMode === 'form' && (selectedReceipt ? 'Cập nhật phiếu' : 'Thêm mới phiếu')}
                {viewMode === 'dashboard' && 'Tổng quan'}
                {viewMode === 'orderinfo' && 'Danh sách đơn'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="bg-transparent">
                <Users size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="bg-transparent">
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
      {/* Receipt Detail Dialog */}
      <ReceiptDetailDialog
        receipt={viewingReceipt}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onPrint={handlePrint}
      />
    </div>
  );
}

