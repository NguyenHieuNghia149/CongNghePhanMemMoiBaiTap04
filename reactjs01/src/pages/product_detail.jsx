import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Button, Col, Row, Skeleton, Space, Tag, Typography, Image,
  notification, List, Form, Input, Rate, Divider, InputNumber, Breadcrumb, Tabs, Avatar
} from 'antd';
import {
  ShoppingOutlined, EyeOutlined, ShoppingCartOutlined,
  CommentOutlined, HomeOutlined, CheckCircleOutlined, CarOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import {
  getProductByIdApi, addItemToCartGql, addProductViewApi,
  getProductStatsApi, getProductCommentsApi, createProductCommentApi,
  toggleFavoriteApi, getFavoriteProductsApi, getSimilarProductsApi
} from '../utils/api';
import { AuthContext } from '../components/context/auth.context';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductDetailPage = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [stats, setStats] = useState({
    viewCount: 0, buyersCount: 0, purchasedQuantity: 0, commentCount: 0,
  });

  const [api, contextHolder] = notification.useNotification();
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const hasTrackedView = useRef(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favorites, setFavorites] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductByIdApi(id);
        if (res?.EC === 0) setProduct(res.data);
        else api.error({ message: 'Lỗi', description: res?.EM || 'Không tìm thấy sản phẩm.' });
      } catch (error) {
        console.error("Fetch product error:", error);
        api.error({ message: 'Lỗi', description: 'Lỗi tải trang.' });
      } finally { setLoading(false); }
    };

    const fetchStats = async () => {
      try {
        const res = await getProductStatsApi(id);
        if (res?.EC === 0 && res.data) setStats(res.data);
      } catch (error) { console.log(error); }
    };

    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        const res = await getProductCommentsApi(id);
        if (res?.EC === 0 && Array.isArray(res.data)) setComments(res.data);
      } catch (error) { console.log(error); }
      finally { setCommentLoading(false); }
    };

    const fetchFavorites = async () => {
      try {
        if (!auth?.isAuthenticated) {
          setFavoriteIds(new Set());
          setFavorites([]);
          return;
        }
        const res = await getFavoriteProductsApi();
        if (res?.EC === 0 && Array.isArray(res.data)) {
          setFavorites(res.data);
          const ids = new Set(res.data.map((p) => p._id));
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSimilar = async () => {
      try {
        const res = await getSimilarProductsApi(id, 6);
        if (res?.EC === 0 && Array.isArray(res.data)) {
          setSimilarProducts(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (id && !hasTrackedView.current) {
      hasTrackedView.current = true;
      fetchProduct();
      addProductViewApi(id).catch((err) => console.log(err));
      fetchStats();
      fetchComments();
      fetchFavorites();
      fetchSimilar();
    }
  }, [id, api, auth?.isAuthenticated]);

  const handleAddToCart = async () => {
    if (!product?._id) return;
    try {
      const res = await addItemToCartGql(product._id, quantity);
      if (res?.data?.addItemToCart?.EC === 0) {
        api.success({
          message: 'Thêm vào giỏ thành công!',
          description: `Đã thêm ${quantity} sản phẩm ${product.name}`,
          placement: 'topRight',
          icon: <ShoppingOutlined style={{ color: '#52c41a' }} />,
        });
      } else {
        api.error({ message: 'Thất bại', description: res?.data?.addItemToCart?.EM });
      }
    } catch (error) {
      console.error(error);
      api.error({ message: 'Lỗi', description: 'Không thể thêm vào giỏ hàng.' });
    }
  };

  const handleSubmitComment = async () => {
    if (!auth?.isAuthenticated) {
      api.warning({ message: 'Vui lòng đăng nhập để bình luận' });
      return;
    }
    if (!commentContent.trim()) {
      api.warning({ message: 'Nội dung trống', description: 'Hãy nhập gì đó...' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await createProductCommentApi(id, commentContent.trim(), commentRating);
      if (res?.EC === 0) {
        api.success({ message: 'Đã gửi đánh giá' });
        setComments((prev) => [res.data, ...(prev || [])]);
        setCommentContent('');
        setCommentRating(5);
        setStats((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      } else {
        api.error({ message: 'Lỗi', description: res?.EM });
      }
    } catch (error) {
      console.error(error);
      api.error({ message: 'Lỗi hệ thống' });
    } finally { setSubmitting(false); }
  };

  const formattedPrice = useMemo(() => {
    if (!product?.price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  }, [product]);

  const isFavorite = useMemo(
    () => (product?._id ? favoriteIds.has(product._id) : false),
    [favoriteIds, product]
  );

  const handleToggleFavorite = async () => {
    if (!auth?.isAuthenticated) {
      api.warning({ message: 'Vui lòng đăng nhập để yêu thích sản phẩm' });
      return;
    }
    if (!product?._id) return;

    try {
      const res = await toggleFavoriteApi(product._id);
      if (res?.EC === 0) {
        const next = new Set(favoriteIds);
        if (next.has(product._id)) next.delete(product._id);
        else next.add(product._id);
        setFavoriteIds(next);
        api.success({ message: res.EM || 'Cập nhật yêu thích thành công' });
      } else {
        api.error({ message: 'Lỗi', description: res?.EM || 'Không thể cập nhật yêu thích' });
      }
    } catch (error) {
      console.error(error);
      api.error({ message: 'Lỗi', description: 'Không thể cập nhật yêu thích' });
    }
  };

  // --- QUAN TRỌNG: TẠO TAB ITEMS TRỰC TIẾP TẠI ĐÂY ---
  // Không dùng component con (ReviewsTab) nữa để tránh lỗi render
  const tabItems = [
    {
      key: '1',
      label: 'Mô tả chi tiết',
      children: (
        <div className="py-4">
          <Paragraph className="text-base leading-7 text-gray-700 whitespace-pre-line">
            {product?.description}
          </Paragraph>
        </div>
      ),
    },
    {
      key: '2',
      label: `Đánh giá & Nhận xét (${stats.commentCount})`,
      children: (
        <div className="mt-4">
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center border border-gray-100">
            <Title level={4}>Khách hàng nói gì về sản phẩm này?</Title>
            <Rate disabled allowHalf value={4.5} style={{ fontSize: 24, color: '#fadb14' }} />
            <Text className="block mt-2 type-secondary">{stats.commentCount} đánh giá • {stats.purchasedQuantity} đã bán</Text>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="sticky top-4">
                <Title level={5}>Viết đánh giá của bạn</Title>
                <Form layout="vertical" onFinish={handleSubmitComment}>
                  <Form.Item label="Mức độ hài lòng" style={{ marginBottom: 12 }}>
                    <Rate value={commentRating} onChange={setCommentRating} />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 12 }}>
                    <TextArea
                      rows={4}
                      value={commentContent}
                      // Giờ đây onChange sẽ hoạt động mượt mà vì không bị unmount component
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Sản phẩm dùng thế nào? Chất lượng ra sao?"
                      maxLength={300} showCount
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={submitting} block size="large">
                    Gửi đánh giá
                  </Button>
                </Form>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <List
                loading={commentLoading}
                dataSource={comments}
                itemLayout="horizontal"
                locale={{ emptyText: <div className="text-center py-10"><CommentOutlined style={{ fontSize: 40, color: '#ddd' }} /><p>Chưa có đánh giá nào.</p></div> }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.userId?.name?.[0] || 'U'}</Avatar>}
                      title={
                        <div className="flex justify-between items-center">
                          <Text strong>{item.userId?.name || 'Khách hàng'}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                        </div>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Rate disabled value={item.rating} style={{ fontSize: 12 }} />
                          <Paragraph style={{ margin: 0, color: '#333' }}>{item.content}</Paragraph>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-10">
      {contextHolder}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { title: <Link to="/"><HomeOutlined /></Link> },
            { title: <Link to="/products">Sản phẩm</Link> },
            { title: product?.name || 'Chi tiết' },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading || !product ? (
          <div className="bg-white p-8 rounded-xl shadow-sm"><Skeleton active avatar paragraph={{ rows: 10 }} /></div>
        ) : (
          <>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <Row gutter={[48, 32]}>
                <Col xs={24} md={10} lg={9}>
                  <div className="border border-gray-100 rounded-xl overflow-hidden relative group">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full object-contain object-center hover:scale-105 transition-transform duration-500"
                        style={{ maxHeight: '450px', width: '100%' }}
                      />
                    ) : (
                      <div className="h-96 bg-gray-50 flex items-center justify-center text-gray-300">
                        <ShoppingOutlined style={{ fontSize: 80 }} />
                      </div>
                    )}
                  </div>
                </Col>

                <Col xs={24} md={14} lg={15}>
                  <Space direction="vertical" size="middle" className="w-full">
                    <div className="flex justify-between items-start">
                      <Space>
                        {product.brand && <Tag color="cyan" className="uppercase font-bold">{product.brand}</Tag>}
                        {product.category && <Tag color="blue">{product.category}</Tag>}
                      </Space>
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary" style={{ fontSize: 13 }}><EyeOutlined /> {stats.viewCount} xem</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}><ShoppingCartOutlined /> {stats.purchasedQuantity} đã bán</Text>
                      </Space>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Title level={2} style={{ margin: 0, fontWeight: 700 }}>{product.name}</Title>
                      <Button
                        type={isFavorite ? 'primary' : 'default'}
                        shape="round"
                        size="middle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite();
                        }}
                      >
                        {isFavorite ? '♥ Đã thích' : '♡ Yêu thích'}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Rate disabled allowHalf defaultValue={4.5} style={{ fontSize: 14 }} />
                      <Text type="secondary" underline className="cursor-pointer hover:text-blue-500">
                        (Xem {stats.commentCount} đánh giá)
                      </Text>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                      <Text className="text-3xl md:text-4xl font-bold text-red-600 block">
                        {formattedPrice}
                      </Text>
                      <Text type="success" className="text-sm font-medium flex items-center mt-1">
                        <CheckCircleOutlined className="mr-1" /> Còn hàng - Sẵn sàng giao ngay
                      </Text>
                    </div>

                    <Paragraph className="text-gray-500 text-base" ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                      {product.description}
                    </Paragraph>

                    <Divider style={{ margin: '12px 0' }} />

                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                      <div>
                        <Text className="block mb-2 font-medium">Số lượng:</Text>
                        <InputNumber
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={setQuantity}
                          size="large"
                          style={{ width: 120 }}
                        />
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        icon={<ShoppingOutlined />}
                        onClick={handleAddToCart}
                        className="flex-1 h-12 text-lg font-semibold shadow-md shadow-blue-200"
                      >
                        Thêm vào giỏ hàng
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CarOutlined className="text-xl text-blue-500" /> Giao hàng toàn quốc
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <SafetyCertificateOutlined className="text-xl text-blue-500" /> Bảo hành chính hãng
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <CheckCircleOutlined className="text-xl text-blue-500" /> Đổi trả trong 7 ngày
                      </div>
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              {/* SỬ DỤNG BIẾN items ĐÃ KHAI BÁO BÊN TRÊN */}
              <Tabs defaultActiveKey="1" size="large" items={tabItems} />
            </div>

            {/* Danh sách yêu thích của bạn */}
            {auth?.isAuthenticated && favorites.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
                <Title level={4} style={{ marginBottom: 16 }}>Sản phẩm bạn đã yêu thích</Title>
                <Row gutter={[16, 16]}>
                  {favorites.map((fav) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={fav._id}>
                      <Link to={`/products/${fav._id}`}>
                        <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                          <div className="h-40 bg-pink-50 flex items-center justify-center overflow-hidden">
                            {fav.image ? (
                              <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingOutlined style={{ fontSize: 36, color: '#ff85c0' }} />
                            )}
                          </div>
                          <div className="p-3 flex flex-col flex-1">
                            <Text strong ellipsis={{ tooltip: fav.name }}>{fav.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {fav.brand} • {fav.category}
                            </Text>
                            <Text strong style={{ color: '#ff4d4f', marginTop: 4 }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fav.price)}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Sản phẩm tương tự */}
            {similarProducts.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-6">
                <Title level={4} style={{ marginBottom: 16 }}>Sản phẩm tương tự</Title>
                <Row gutter={[16, 16]}>
                  {similarProducts.map((sp) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={sp._id}>
                      <Link to={`/products/${sp._id}`}>
                        <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                          <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                            {sp.image ? (
                              <img src={sp.image} alt={sp.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingOutlined style={{ fontSize: 36, color: '#ccc' }} />
                            )}
                          </div>
                          <div className="p-3 flex flex-col flex-1">
                            <Text strong ellipsis={{ tooltip: sp.name }}>{sp.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {sp.brand} • {sp.category}
                            </Text>
                            <Text strong style={{ color: '#ff4d4f', marginTop: 4 }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.price)}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;