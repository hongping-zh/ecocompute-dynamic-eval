# 项目核心文件保存备忘录

**项目名称**: EcoCompute Dynamic Eval  
**仓库地址**: https://github.com/hongping-zh/ecocompute-dynamic-eval  
**最后更新**: 2026-02-07

## 📋 核心文件清单

### 🎯 主要应用文件
- [x] `App.tsx` - 主应用组件
- [x] `index.tsx` - 应用入口
- [x] `index.html` - HTML 模板
- [x] `index.css` - 全局样式

### 🧩 组件文件 (components/)
- [x] `AITools.tsx` - AI 工具组件
- [x] `AudioMonitor.tsx` - 音频监控组件
- [x] `Calculator.tsx` - 计算器组件
- [x] `DeepSeekVsGpt.tsx` - DeepSeek vs GPT 对比组件
- [x] `Leaderboard.tsx` - 排行榜组件
- [x] `Methodology.tsx` - 方法论组件
- [x] `Pricing.tsx` - 定价组件
- [x] `SettingsPanel.tsx` - 设置面板组件

### ⚙️ 服务层文件 (services/)
- [x] `engine.ts` - 核心引擎
- [x] `geminiService.ts` - Gemini API 服务
- [x] `types.ts` - 服务类型定义
- [x] `providers/index.ts` - 提供商索引
- [x] `providers/demo.ts` - 演示提供商
- [x] `providers/gemini.ts` - Gemini 提供商
- [x] `providers/groq.ts` - Groq 提供商
- [x] `providers/openai.ts` - OpenAI 提供商

### 📝 类型与常量
- [x] `types.ts` - 全局类型定义
- [x] `constants.ts` - 常量配置（15KB+）

### 🔧 配置文件
- [x] `package.json` - 项目依赖配置
- [x] `package-lock.json` - 依赖锁定文件
- [x] `tsconfig.json` - TypeScript 配置
- [x] `vite.config.ts` - Vite 构建配置
- [x] `.gitignore` - Git 忽略规则

### 🚀 部署配置
- [x] `.github/workflows/deploy.yml` - GitHub Actions 部署流程

### 📚 文档文件
- [x] `README.md` - 项目说明文档
- [x] `MEMO_2026-02-05.md` - 开发备忘录
- [x] `ROADMAP_V2.md` - 产品路线图 V2
- [x] `metadata.json` - 元数据配置

### 🌐 公共资源 (public/)
- [x] `robots.txt` - 搜索引擎爬虫配置
- [x] `sitemap.xml` - 网站地图

## 🔒 不应提交的文件

### 敏感信息
- [ ] `.env.local` - **包含 API 密钥，已被 .gitignore 排除**
  - 包含: VITE_GEMINI_API_KEY 等敏感信息
  - 状态: 正确地未提交到仓库

### 构建产物
- [ ] `node_modules/` - 依赖包目录
- [ ] `dist/` - 构建输出目录
- [ ] `dist-ssr/` - SSR 构建输出

### 日志文件
- [ ] `*.log` - 各类日志文件
- [ ] `*.local` - 本地配置文件

## ✅ 验证检查清单

### 代码完整性
- [x] 所有 TypeScript/TSX 源文件已提交
- [x] 所有组件文件已提交
- [x] 所有服务层文件已提交
- [x] 类型定义文件完整

### 配置完整性
- [x] 构建配置文件已提交
- [x] 部署配置文件已提交
- [x] TypeScript 配置已提交
- [x] Git 配置已提交

### 文档完整性
- [x] README 文档已提交
- [x] 开发备忘录已提交
- [x] 路线图文档已提交
- [x] 元数据配置已提交

### 安全检查
- [x] 敏感信息未提交
- [x] .gitignore 配置正确
- [x] API 密钥已排除

## 📊 统计信息

- **总文件数**: 35 个已追踪文件
- **代码文件**: 23 个 (.tsx, .ts)
- **配置文件**: 6 个
- **文档文件**: 4 个
- **其他文件**: 2 个

## 🔄 同步状态

- **最后推送**: 2026-02-07 15:49 UTC+8
- **提交范围**: ea930de..64045da
- **分支**: main
- **状态**: ✅ 已同步

## 📝 备注

1. `.env.local` 文件包含 API 密钥，不应提交到公开仓库
2. 其他开发者需要创建自己的 `.env.local` 文件
3. 所有核心业务逻辑和配置都已安全保存
4. 项目可以通过 `package.json` 完整重建依赖

## 🎯 下次检查要点

- [ ] 确认新增文件是否需要提交
- [ ] 检查是否有遗漏的文档更新
- [ ] 验证 .gitignore 规则是否需要调整
- [ ] 确认部署配置是否需要更新
