import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import {
  getAllProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../utils/api';
import { useContext } from 'react';
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
  const [form] = Form.useForm();
  const observerTarget = useRef(null);
  const limit = 10;

  // Lấy danh sách sản phẩm
  const fetchProducts = useCallback(async (page = 1, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      
      const res = await getAllProductsApi(params);
      
      if (res && res.EC === 0) {
        const newProducts = res.data || [];
        
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        
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
  }, [loading]);

  useEffect(() => {
    fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, currentPage, fetchProducts]);

  // Mở modal tạo mới
  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      const res = await deleteProductApi(id);
      if (res && res.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: 'Xóa sản phẩm thành công',
        });
        // Reload products
        fetchProducts(1, true);
      } else {
        notification.error({
          message: 'Lỗi',
          description: res?.EM || 'Không thể xóa sản phẩm',
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa sản phẩm',
      });
    }
  };

  // Submit form
  const handleSubmit = async (values) => {
    try {
      // Validate và format dữ liệu trước khi gửi
      const productData = {
        name: values.name?.trim(),
        price: Number(values.price),
        description: values.description?.trim(),
        image: values.image?.trim(),
        category: values.category?.trim(),
        brand: values.brand?.trim(),
      };

      // Validate lại trên client side
      if (!productData.name || productData.name.length < 3 || productData.name.length > 30) {
        notification.error({
          message: 'Lỗi validation',
          description: 'Tên sản phẩm phải từ 3 đến 30 ký tự!',
        });
        return;
      }

      if (!productData.price || productData.price < 0) {
        notification.error({
          message: 'Lỗi validation',
          description: 'Giá sản phẩm phải lớn hơn hoặc bằng 0!',
        });
        return;
      }

      if (!productData.description || productData.description.length < 3 || productData.description.length > 100) {
        notification.error({
          message: 'Lỗi validation',
          description: 'Mô tả phải từ 3 đến 100 ký tự!',
        });
        return;
      }

      if (!productData.image || productData.image.length < 3 || productData.image.length > 100) {
        notification.error({
          message: 'Lỗi validation',
          description: 'URL hình ảnh phải từ 3 đến 100 ký tự!',
        });
        return;
      }

      if (!productData.category || productData.category.length < 3 || productData.category.length > 100) {
        notification.error({
          message: 'Lỗi validation',
          description: 'Danh mục phải từ 3 đến 100 ký tự!',
        });
        return;
      }

      if (!productData.brand || productData.brand.length < 3 || productData.brand.length > 100) {
        notification.error({
          message: 'Lỗi validation',
          description: 'Thương hiệu phải từ 3 đến 100 ký tự!',
        });
        return;
      }

      let res;
      if (editingProduct) {
        res = await updateProductApi(editingProduct._id, productData);
      } else {
        res = await createProductApi(productData);
      }

      if (res && res.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: editingProduct ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công',
        });
        setIsModalOpen(false);
        form.resetFields();
        // Reload products
        fetchProducts(1, true);
      } else {
        notification.error({
          message: 'Lỗi',
          description: res?.EM || 'Có lỗi xảy ra',
        });
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu sản phẩm',
      });
    }
  };

  const isAdmin = auth?.user?.role === 'admin';
  //const isAuthenticated = auth?.isAuthenticated;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>
            <ShoppingOutlined /> Danh sách Sản phẩm
          </Title>
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Thêm sản phẩm
            </Button>
          )}
        </div>

        <Divider />

        {/* Products List */}
        {products.length === 0 && !loading ? (
          <Empty description="Không có sản phẩm nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                    <Card
                      hoverable
                      cover={
                        product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            height={200}
                            style={{ objectFit: 'cover' }}
                            preview={false}
                          />
                        ) : (
                          <div
                            style={{
                              height: 200,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f0f0f0',
                            }}
                          >
                            <ShoppingOutlined style={{ fontSize: 48, color: '#ccc' }} />
                          </div>
                        )
                      }
                      actions={
                        isAdmin
                          ? [
                              <EditOutlined
                                key="edit"
                                onClick={() => handleEdit(product)}
                              />,
                              <Popconfirm
                                title="Xóa sản phẩm"
                                description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Paragraph
                              ellipsis={{ rows: 2, expandable: false }}
                              style={{ marginBottom: 0, minHeight: '40px' }}
                            >
                              {product.description}
                            </Paragraph>
                            <div>
                              <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(product.price)}
                              </Text>
                            </div>
                            <div>
                              <Tag color="purple">{product.brand}</Tag>
                            </div>
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
          </Row>
        )}

        {/* Loading indicator for lazy loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        )}

        {/* Observer target for lazy loading */}
        <div ref={observerTarget} style={{ height: '20px' }} />
      </Space>

      {/* Create/Edit Modal */}
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
              { 
                min: 3, 
                message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' 
              },
              { 
                max: 30, 
                message: 'Tên sản phẩm không được quá 30 ký tự!' 
              },
              {
                whitespace: true,
                message: 'Tên sản phẩm không được chỉ có khoảng trắng!',
              },
            ]}
            hasFeedback
          >
            <Input 
              placeholder="Nhập tên sản phẩm" 
              showCount
              maxLength={30}
            />
          </Form.Item>

          <Form.Item
            label="Giá (VND)"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
              { 
                type: 'number', 
                message: 'Giá phải là một số hợp lệ!' 
              },
              { 
                type: 'number',
                min: 0, 
                message: 'Giá phải lớn hơn hoặc bằng 0!' 
              },
              {
                validator: (_, value) => {
                  if (!value && value !== 0) {
                    return Promise.reject(new Error('Vui lòng nhập giá sản phẩm!'));
                  }
                  if (value < 0) {
                    return Promise.reject(new Error('Giá không được âm!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá sản phẩm"
              formatter={(value) => {
                if (!value) return '';
                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }}
              parser={(value) => {
                if (!value) return '';
                return value.replace(/\$\s?|(,*)/g, '');
              }}
              min={0}
              step={1000}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả sản phẩm!' },
              { 
                min: 3, 
                message: 'Mô tả phải có ít nhất 3 ký tự!' 
              },
              { 
                max: 100, 
                message: 'Mô tả không được quá 100 ký tự!' 
              },
              {
                whitespace: true,
                message: 'Mô tả không được chỉ có khoảng trắng!',
              },
            ]}
            hasFeedback
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả sản phẩm"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh (URL)"
            name="image"
            rules={[
              { required: true, message: 'Vui lòng nhập URL hình ảnh!' },
              { 
                min: 3, 
                message: 'URL hình ảnh phải có ít nhất 3 ký tự!' 
              },
              { 
                max: 100, 
                message: 'URL hình ảnh không được quá 100 ký tự!' 
              },
              {
                type: 'url',
                message: 'Vui lòng nhập URL hợp lệ (ví dụ: https://example.com/image.jpg)!',
              },
              {
                pattern: /^https?:\/\/.+/,
                message: 'URL phải bắt đầu bằng http:// hoặc https://',
              },
            ]}
            hasFeedback
            extra="Ví dụ: https://example.com/image.jpg"
          >
            <Input 
              placeholder="https://example.com/image.jpg" 
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[
              { required: true, message: 'Vui lòng nhập danh mục sản phẩm!' },
              { 
                min: 3, 
                message: 'Danh mục phải có ít nhất 3 ký tự!' 
              },
              { 
                max: 100, 
                message: 'Danh mục không được quá 100 ký tự!' 
              },
              {
                whitespace: true,
                message: 'Danh mục không được chỉ có khoảng trắng!',
              },
            ]}
            hasFeedback
          >
            <Input 
              placeholder="Nhập danh mục sản phẩm" 
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="Thương hiệu"
            name="brand"
            rules={[
              { required: true, message: 'Vui lòng nhập thương hiệu!' },
              { 
                min: 3, 
                message: 'Thương hiệu phải có ít nhất 3 ký tự!' 
              },
              { 
                max: 100, 
                message: 'Thương hiệu không được quá 100 ký tự!' 
              },
              {
                whitespace: true,
                message: 'Thương hiệu không được chỉ có khoảng trắng!',
              },
            ]}
            hasFeedback
          >
            <Input 
              placeholder="Nhập thương hiệu sản phẩm" 
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item>
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
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;

