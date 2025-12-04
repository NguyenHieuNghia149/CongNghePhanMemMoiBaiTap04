
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button as LibButton,
  Modal as LibModal,
  Card as LibCard,
  CartItemCard,
} from 'hieunghia-shopping-cart-lib';
import { Spin, Typography, Divider, notification } from 'antd';
import {
  getCartGql,
  updateCartItemGql,
  removeCartItemGql,
  clearCartGql,
  toggleItemSelectionGql,
  getSelectedItemsForCheckoutGql,
  createOrderApi,
} from '../utils/api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { Title, Text } = Typography;

  // Chuẩn hóa data để truyền cho CartItemCard
  const uiItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.map((item) => ({
      id: item._id,
      name: item.productId?.name || 'Sản phẩm không tồn tại',
      price: item.productId?.price || 0,
      quantity: item.quantity,
      image: item.productId?.image || '',
      selected: item.selected,
    }));
  }, [cart]);

  const totalAmount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const selectedCount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.filter((i) => i.selected).length;
  }, [cart]);

  const allSelected = useMemo(() => {
    if (!cart?.items || cart.items.length === 0) return false;
    return cart.items.every((i) => i.selected);
  }, [cart]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await getCartGql();
      if (res?.data?.getCart?.EC === 0) {
        setCart(res.data.getCart.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (id, newQuantity) => {
    // newQuantity <= 0 => xóa item
    if (newQuantity <= 0) {
      await handleRemoveItem(id);
      return;
    }

    const res = await updateCartItemGql(id, newQuantity, undefined);
    if (res?.data?.updateCartItem?.EC === 0) {
      setCart(res.data.updateCartItem.data);
      notification.success({
        message: 'Cập nhật giỏ hàng',
        description: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng.',
      });
    }
  };

  const handleRemoveItem = async (id) => {
    const res = await removeCartItemGql(id);
    if (res?.data?.removeItemFromCart?.EC === 0) {
      setCart(res.data.removeItemFromCart.data);
      notification.success({
        message: 'Giỏ hàng',
        description: 'Đã xóa sản phẩm khỏi giỏ hàng.',
      });
    }
  };

  const handleClearCart = async () => {
    const res = await clearCartGql();
    if (res?.data?.clearCart?.EC === 0) {
      setCart(res.data.clearCart.data);
      notification.success({
        message: 'Giỏ hàng',
        description: 'Đã xóa toàn bộ giỏ hàng.',
      });
    }
  };

  const handleToggleItem = async (id, selected) => {
    const res = await toggleItemSelectionGql([id], selected);
    if (res?.data?.toggleItemSelection?.EC === 0) {
      setCart(res.data.toggleItemSelection.data);
    }
  };

  const handleToggleAll = async () => {
    if (!cart?.items || cart.items.length === 0) return;
    const ids = cart.items.map((i) => i._id);
    const res = await toggleItemSelectionGql(ids, !allSelected);
    if (res?.data?.toggleItemSelection?.EC === 0) {
      setCart(res.data.toggleItemSelection.data);
    }
  };

  const handleOpenCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await getSelectedItemsForCheckoutGql();
      if (res?.data?.getSelectedItemsForCheckout?.EC === 0) {
        setCheckoutData(res.data.getSelectedItemsForCheckout.data);
        setCheckoutModalOpen(true);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <div className="w-full max-w-[1200px]">
        {/* HEADER */}
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-indigo-50 border border-slate-100 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-700">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Giỏ hàng của bạn
            </div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý & thanh toán sản phẩm đã chọn
            </Title>
            <Text type="secondary">
              Kiểm tra lại số lượng, chọn sản phẩm cần thanh toán hoặc xóa bớt nếu không cần thiết.
            </Text>
          </div>

         
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          <LibCard className="shadow-md">
            {uiItems.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Giỏ hàng trống</div>
            ) : (
              <div className="space-y-4">
                {/* Chọn tất cả / Thao tác chung */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 ml-4">
                    <input className='h-4 w-4'
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleAll}
                    />
                    <span>
                      Chọn tất cả ({selectedCount}/{uiItems.length})
                    </span>
                  </div>
                  <LibButton
                    className='mr-4 mt-4'
                    variant="danger"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={uiItems.length === 0}
                  >
                    Xóa toàn bộ giỏ hàng
                  </LibButton>
                </div>

                

                <Divider className="my-2" />

                {/* Danh sách item */}
                <div className="space-y-3">
                  {uiItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border rounded-lg p-3 bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={!!item.selected}
                        onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <CartItemCard
                          item={item}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền + Thanh toán */}
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div>
                    <div className="text-gray-500 text-sm mt-4 ml-4">
                      Đã chọn: <span className="font-semibold">{selectedCount}</span> sản phẩm
                    </div>
                    <div className="text-lg font-semibold mt-4 ml-4">
                      Tổng tạm tính:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(totalAmount)}
                    </div>
                  </div>
                  <LibButton 
                    className='mr-4 mt-4'
                    variant="primary"
                    size="lg"
                    onClick={handleOpenCheckout}
                    disabled={selectedCount === 0}
                  >
                    Thanh toán các sản phẩm đã chọn
                  </LibButton>
                </div>
              </div>
            )}
          </LibCard>
        )}

        {/* Modal xem trước thanh toán */}
        <LibModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          title="Xác nhận thanh toán"
          footer={
            <div className="flex justify-end gap-2">
              <LibButton variant="secondary" onClick={() => setCheckoutModalOpen(false)}>
                Đóng
              </LibButton>
                <LibButton
                  variant="success"
                  onClick={async () => {
                    if (!checkoutData || !checkoutData.items?.length) {
                      setCheckoutModalOpen(false);
                      return;
                    }
                    try {
                      // Chuẩn hóa dữ liệu gửi về backend
                      const orderItems = checkoutData.items.map((item) => ({
                        productId: item.productId?._id,
                        quantity: item.quantity,
                      }));

                      const res = await createOrderApi(orderItems);
                      if (res?.EC === 0) {
                        notification.success({
                          message: 'Đặt hàng thành công',
                          description: 'Đơn hàng của bạn đã được tạo.',
                        });
                        setCheckoutModalOpen(false);
                        // Sau khi đặt hàng có thể xóa giỏ hoặc refetch
                        await loadCart();
                      } else {
                        notification.error({
                          message: 'Đặt hàng thất bại',
                          description: res?.EM || 'Vui lòng thử lại sau.',
                        });
                      }
                    } catch {
                      notification.error({
                        message: 'Lỗi',
                        description: 'Có lỗi xảy ra khi tạo đơn hàng.',
                      });
                    }
                  }}
                >
                  Xác nhận thanh toán
                </LibButton>
            </div>
          }
        >
          {checkoutLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin />
            </div>
          ) : !checkoutData || checkoutData.items?.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              Chưa có sản phẩm nào được chọn để thanh toán
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {checkoutData.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.productId?.name || 'Sản phẩm'} x {item.quantity}
                    </span>
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format((item.productId?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-2 flex justify-between font-semibold">
                <span>Tổng thanh toán</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(checkoutData.totalAmount || 0)}
                </span>
              </div>
            </div>
          )}
        </LibModal>
      </div>
    </div>
  );
};

export default Cart;