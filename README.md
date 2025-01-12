# 班级梦想采访系统

# 部署信息
部署地址: jilu.20204.us.kg

# 路由说明
- `/` - 主页面（表单提交）：用于收集学生信息
- `/jieshao` - 介绍页面：展示项目说明
- `/queren` - 确认提交页面：确认提交信息
- `/error` - 错误页面：显示错误信息
- `/*` - 404页面：处理未知路径

# 域名配置
- 主域名: us.kg
- 子域名: jilu.20204.us.kg

# 项目结构说明
## 核心文件
- `src/App.js` - 主应用组件：包含路由和主要逻辑
- `src/App.css` - 主样式文件：定义全局样式
- `src/index.js` - 应用入口：初始化 React
- `src/index.css` - 全局样式：基础样式定义

## 功能模块
1. 表单提交模块
   - 必填：姓名、号数、兴趣爱好、梦想
   - 选填：手机号、备注

2. 安全验证模块
   - Cloudflare Turnstile 人机验证
   - IP 限制（每个 IP 只能提交一次）
   - 管理员登录功能

3. 数据存储模块
   - Cloudflare KV 存储
   - localStorage 缓存

# API 接口
- `functions/api/check-ip.js` - IP 检查
- `functions/api/save-record.js` - 保存记录
- `functions/api/send-email.js` - 发送邮件

# 配置文件
- `wrangler.toml` - Workers 配置
- `_headers` - HTTP 头配置
- `_redirects` - 路由重定向
- `manifest.json` - PWA 配置
- `package.json` - 项目依赖

# 功能特点
1. 数据双重保存
   - 邮件备份
   - KV 存储

2. 安全措施
   - IP 限制
   - 人机验证
   - 管理员模式

3. 用户体验
   - 响应式设计
   - 表单验证
   - 错误提示
   - 加载状态

# 技术栈
- React.js - 前端框架
- Cloudflare Pages - 托管
- Cloudflare Workers - 后端
- Cloudflare KV - 存储
- Cloudflare Turnstile - 验证

# 部署配置
1. 环境变量
   - SMTP_HOST - 邮件服务器
   - SMTP_PORT - 邮件端口
   - SMTP_USER - 邮件用户
   - SMTP_PASSWORD - 邮件密码

2. KV 配置
   - SUBMISSIONS: IP 记录
   - jilu: 提交记录

# 管理员信息
- 账号：1234
- 密码：suyuhang2013
- 功能：绕过 IP 限制

# 联系方式
邮箱：54@2020classes4.us.kg 