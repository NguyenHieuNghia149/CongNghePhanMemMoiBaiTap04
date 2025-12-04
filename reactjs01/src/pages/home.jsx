import React from 'react';
import { Button } from 'antd';
import { ShoppingOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: text */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Trải nghiệm mua sắm hiện đại với fuzzy search & GraphQL
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Khám phá sản phẩm công nghệ
              <span className="text-sky-600"> thông minh</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-xl">
              Tìm kiếm nhanh, lọc linh hoạt theo danh mục, thương hiệu, khoảng giá
              và quản lý giỏ hàng thời gian thực với GraphQL. Tất cả trong một giao diện đơn giản, đẹp và dễ dùng.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                className="!bg-sky-600 hover:!bg-sky-700"
              >
                Xem sản phẩm
              </Button>

              <Link to="/products">
                <Button size="large" icon={<SearchOutlined />}>
                  Tìm kiếm & lọc nâng cao
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Fuzzy search với Fuse.js
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Giỏ hàng realtime qua GraphQL
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                UI đẹp với Ant Design & Tailwind CSS
              </div>
            </div>
          </div>

          {/* Right: illustration / mockup */}
          <div className="relative">
            <div className="absolute -top-6 -right-4 w-32 h-32 bg-sky-100 rounded-full blur-2xl opacity-70" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-70" />

            <div className="relative bg-white/80 backdrop-blur shadow-xl rounded-3xl p-5 md:p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Bộ lọc nhanh
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    Điện thoại • Laptop • Drone • Phụ kiện
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700">
                  GraphQL Cart
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">Fuzzy search</p>
                    <p className="text-xs text-slate-500">Tìm nhanh theo tên, mô tả, thương hiệu</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Đã bật
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">Bộ lọc linh hoạt</p>
                    <p className="text-xs text-slate-500">Danh mục • Thương hiệu • Khoảng giá</p>
                  </div>
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                    Real-time
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">Giỏ hàng thông minh</p>
                    <p className="text-xs text-slate-500">Chọn nhiều sản phẩm để thanh toán</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    GraphQL API
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple footer */}
      <footer className="border-t border-slate-100 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>Demo JWT • Fuzzy Search • GraphQL Cart</span>
          <span>Built with React, Ant Design & Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
