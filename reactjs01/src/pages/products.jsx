import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Image,
  Popconfirm,
  notification,
  Select,
  Slider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  getAllProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getProductFiltersApi,
} from '../utils/api';
import { AuthContext } from '../components/context/auth.context';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductsPage = () => {
  const { auth } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [priceBounds] = useState([0, 100000000]);

  const [form] = Form.useForm();
  const observerTarget = useRef(null);
  const debounceTimer = useRef(null);

  const limit = 10;

  // ------------------------------------------------
  // Lấy danh sách sản phẩm
  // ------------------------------------------------
  const fetchProducts = useCallback(
    async (page = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const params = { page, limit };

        if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
        if (categoryFilter.trim()) params.category = categoryFilter.trim();
        if (brandFilter.trim()) params.brand = brandFilter.trim();

        const [minP, maxP] = priceRange;
        params.minPrice = Number(minP);
        params.maxPrice = Number(maxP);

        const res = await getAllProductsApi(params);

        if (res && res.EC === 0) {
          const newProducts = res.data || [];

          reset
            ? setProducts(newProducts)
            : setProducts((prev) => [...prev, ...newProducts]);

          setHasMore(newProducts.length === limit && page < res.pagination.totalPages);
          setCurrentPage(page);
        } else {
          notification.error({
            message: 'Lỗi',
            description: res?.EM || 'Không thể tải danh sách sản phẩm',
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Có lỗi xảy ra khi tải danh sách sản phẩm',
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, debouncedSearchTerm, categoryFilter, brandFilter, priceRange]
  );

  // ------------------------------------------------
  // Debounce search
  // ------------------------------------------------
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  // ------------------------------------------------
  // Fetch sản phẩm khi filter thay đổi
  // ------------------------------------------------
  useEffect(() => {
    fetchProducts(1, true);
  }, [debouncedSearchTerm, categoryFilter, brandFilter, priceRange]);

  // ------------------------------------------------
  // Infinite Scroll
  // ------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    const current = observerTarget.current;
    if (current) observer.observe(current);

    return () => current && observer.unobserve(current);
  }, [hasMore, loading, currentPage, fetchProducts]);

  // ------------------------------------------------
  // Fetch Filters (category + brand)
  // ------------------------------------------------
  const fetchFilters = async () => {
    try {
      const res = await getProductFiltersApi();
      if (res?.EC === 0) {
        const cats = (res.data.categories || []).map(c => ({
          label: c,
          value: c,
        }));

        const brs = (res.data.brands || []).map(b => ({
          label: b,
          value: b,
        }));



        setAllCategories(cats);
        setAllBrands(brs);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const categoryOptions = useMemo(
    () => [{ label: 'Tất cả', value: '' }, ...allCategories],
    [allCategories]
  );

  const brandOptions = useMemo(
    () => [{ label: 'Tất cả', value: '' }, ...allBrands],
    [allBrands]
  );

  // ------------------------------------------------
  // Modal Create / Edit
  // ------------------------------------------------
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteProductApi(id);
      if (res?.EC === 0) {
        notification.success({ message: 'Thành công', description: 'Xóa sản phẩm thành công' });
        fetchProducts(1, true);
        fetchFilters();
      }
    } catch {
      notification.error({ message: 'Lỗi', description: 'Có lỗi khi xóa sản phẩm' });
    }
  };

  // ------------------------------------------------
  // Submit create/update
  // ------------------------------------------------
  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name.trim(),
        price: Number(values.price),
        description: values.description.trim(),
        image: values.image.trim(),
        category: values.category.trim(),
        brand: values.brand.trim(),
      };

      const res = editingProduct
        ? await updateProductApi(editingProduct._id, data)
        : await createProductApi(data);

      if (res?.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: editingProduct ? 'Cập nhật thành công' : 'Tạo sản phẩm thành công',
        });
        setIsModalOpen(false);
        form.resetFields();
        fetchProducts(1, true);
      }
    } catch {
      notification.error({ message: 'Lỗi', description: 'Có lỗi khi lưu sản phẩm' });
    }
  };

  // ------------------------------------------------
  // Handle Filters
  // ------------------------------------------------
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleFilterChange = (field, value) => {
    if (field === 'category') setCategoryFilter(value || '');
    if (field === 'brand') setBrandFilter(value || '');
    if (field === 'priceRange') setPriceRange(value);

    setCurrentPage(1);
    setHasMore(true);
  };

  const isAdmin = auth?.user?.role === 'admin';

  // ------------------------------------------------
  // RENDER UI
  // ------------------------------------------------
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>
          <ShoppingOutlined /> Danh sách Sản phẩm
        </Title>

        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
            Thêm sản phẩm
          </Button>
        )}
      </div>

      <Row gutter={16}>
        {/* FILTER SIDEBAR */}
        <Col xs={24} md={7} lg={6}>
          <Card size="small" title="Bộ lọc" bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              
              {/* Search */}
              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />

              <Form layout="vertical">
                {/* Category */}
                <Form.Item label="Danh mục">
                  <Select
                    allowClear
                    placeholder="Chọn danh mục"
                    options={categoryOptions}
                    value={categoryFilter || undefined}
                    onChange={(v) => handleFilterChange('category', v)}
                  />
                </Form.Item>

                {/* Brand */}
                <Form.Item label="Thương hiệu">
                  <Select
                    allowClear
                    showSearch
                    placeholder="Chọn thương hiệu"
                    options={brandOptions}
                    value={brandFilter || undefined}
                    onChange={(v) => handleFilterChange('brand', v)}
                    filterOption={(input, option) =>
                      option?.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                {/* Price Range */}
                <Form.Item
                  label={
                    <Space>
                      Khoảng giá (VND)
                      <Text type="secondary">
                        {new Intl.NumberFormat('vi-VN').format(priceRange[0])} -{' '}
                        {new Intl.NumberFormat('vi-VN').format(priceRange[1])}
                      </Text>
                    </Space>
                  }
                >
                  <Slider
                    range
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange}
                    onChange={(v) => handleFilterChange('priceRange', v)}
                  />
                </Form.Item>
              </Form>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearchTerm('');
                  setCategoryFilter('');
                  setBrandFilter('');
                  setPriceRange(priceBounds);
                  fetchProducts(1, true);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Card>
        </Col>

        {/* PRODUCT LIST */}
        <Col xs={24} md={17} lg={18}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {products.length === 0 && !loading ? (
              <Empty description="Không có sản phẩm" />
            ) : (
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col xs={24} sm={12} md={12} lg={8} key={product._id}>
                    <Card
                      hoverable
                      cover={
                        product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            height={200}
                            preview={false}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 200,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: '#eee',
                            }}
                          >
                            <ShoppingOutlined style={{ fontSize: 48, color: '#bbb' }} />
                          </div>
                        )
                      }
                      actions={
                        isAdmin
                          ? [
                              <EditOutlined key="edit" onClick={() => handleEdit(product)} />,
                              <Popconfirm
                                title="Xóa sản phẩm"
                                description="Bạn có chắc muốn xóa?"
                                onConfirm={() => handleDelete(product._id)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                              </Popconfirm>,
                            ]
                          : []
                      }
                    >
                      <Card.Meta
                        title={product.name}
                        description={
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Paragraph ellipsis={{ rows: 2 }}>
                              {product.description}
                            </Paragraph>

                            <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(product.price)}
                            </Text>

                            <Tag color="purple">{product.brand}</Tag>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin size="large" />
              </div>
            )}

            <div ref={observerTarget} style={{ height: 20 }} />
          </Space>
        </Col>
      </Row>

      {/* MODAL FORM */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên!' },
              { min: 3, max: 30 },
            ]}
          >
            <Input showCount maxLength={30} />
          </Form.Item>

          <Form.Item
            label="Giá (VND)"
            name="price"
            rules={[{ required: true }, { type: 'number', min: 0 }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/(,*)/g, '')}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true },
              { min: 3, max: 100 },
            ]}
          >
            <TextArea rows={4} maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            label="Hình ảnh (URL)"
            name="image"
            rules={[
              { required: true },
              { type: 'url', message: 'URL không hợp lệ!' },
              { pattern: /^https?:\/\//, message: 'Phải bắt đầu bằng http/https' },
            ]}
          >
            <Input showCount maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[
              { required: true },
              { min: 3, max: 100 },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thương hiệu"
            name="brand"
            rules={[
              { required: true },
              { min: 3, max: 100 },
            ]}
          >
            <Input />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              {editingProduct ? 'Cập nhật' : 'Tạo mới'}
            </Button>

            <Button
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
