# 班级梦想采访系统

部署地址: jilu.20204.us.kg

## 路由说明
- `/` - 主页面（表单提交）
- `/jieshao` - 介绍页面
- `/queren` - 确认提交页面
- `/error` - 错误页面
- `/*` - 404页面

## 配置信息
- 主域名: us.kg
- 子域名: jilu.20204.us.kg

## 项目结构

### 核心文件
- `src/App.js` - 主应用组件，包含所有业务逻辑
- `src/App.css` - 主应用样式文件
- `src/index.js` - 应用入口文件
- `src/index.css` - 全局样式文件

### 功能模块
1. 表单提交模块
   - 必填项：姓名、号数、兴趣爱好、梦想
   - 选填项：手机号、备注

2. 安全验证模块
   - Cloudflare Turnstile 人机验证
   - IP 限制（每个 IP 只能提交一次）
   - 管理员登录功能

3. 数据存储模块
   - 使用 Cloudflare KV 存储记录
   - 本地存储（localStorage）缓存

### API 接口
- `functions/api/check-ip.js` - IP 检查接口
- `functions/api/save-record.js` - 记录保存接口
- `functions/api/send-email.js` - 邮件发送接口

### 配置文件
- `wrangler.toml` - Cloudflare Workers 配置
- `_headers` - HTTP 响应头配置
- `_redirects` - 路由重定向配置
- `manifest.json` - PWA 配置文件
- `package.json` - 项目依赖配置

## 功能特点

1. 数据双重保存
   - 发送邮件到指定邮箱
   - 保存到 Cloudflare KV 存储

2. 安全措施
   - IP 限制提交次数
   - 人机验证
   - 管理员模式

3. 用户友好
   - 响应式设计
   - 表单验证
   - 错误提示
   - 加载状态

## 技术栈

- React.js - 前端框架
- Cloudflare Pages - 托管服务
- Cloudflare Workers - 服务端功能
- Cloudflare KV - 数据存储
- Cloudflare Turnstile - 人机验证

## 部署说明

1. 环境变量配置
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASSWORD

2. KV 命名空间
   - SUBMISSIONS: 用于 IP 记录
   - jilu: 用于存储提交的记录

## 管理员功能

- 账号：1234
- 密码：suyuhang2013
- 功能：绕过 IP 限制，可以多次提交

## 联系方式

有问题请发送邮件至：54@2020classes4.us.kg 