// 主题功能启动器
$(document).ready(function () {
  // 在控制台显示主题信息（开发者调试用）
  Stun.utils.showThemeInConsole()

  // 注册文章切换快捷键（上一篇/下一篇）
  if (CONFIG.shortcuts && CONFIG.shortcuts.switchPost) {
    Stun.utils.registerSwitchPost()
  }

  // 为外部链接添加图标标识（只在页脚区域，这部分不需要重新加载）
  if (CONFIG.externalLink) {
    Stun.utils.addIconToExternalLink('#footer')
  }

  // 定义主题功能初始化函数（支持 PJAX 无刷新加载）
  Stun.utils.pjaxReloadBoot = function () {
    // 代码块功能配置
    if (CONFIG.codeblock) {
      var codeStyle = CONFIG.codeblock.style
      // 根据代码块样式配置添加不同功能
      if (codeStyle === 'default') {
        this.addCodeHeader()        // 添加代码语言标签
        this.addCopyButton()        // 添加复制按钮
      } else if (codeStyle === 'carbon') {
        this.addCodeHeader('carbon')  // Carbon 风格的代码头部
        this.addCopyButton('carbon')  // Carbon 风格的复制按钮
      } else if (codeStyle === 'simple') {
        this.addCopyButton('simple')  // 简易风格的复制按钮
      }
      this.registerCopyEvent()      // 注册复制按钮点击事件
    }
    
    // 打赏功能
    if (CONFIG.reward) {
      this.registerShowReward()     // 注册打赏按钮显示事件
    }
    
    // 图片懒加载
    if (CONFIG.lazyload) {
      this.lazyLoadImage()          // 启用图片懒加载功能
    }
    
    // 瀑布流相册
    if (CONFIG.galleryWaterfall) {
      this.showImageToWaterfall()   // 将图片转换为瀑布流布局
    }
    
    // 外部链接图标（全文范围）
    if (CONFIG.externalLink) {
      var CONTAINER = '.archive, .post-title'  // 在归档页和文章标题区域
      this.addIconToExternalLink(CONTAINER)    // 为外部链接添加图标
    }
    
    // 图片查看功能
    if (CONFIG.fancybox) {
      this.wrapImageWithFancyBox()  // 使用 Fancybox 灯箱效果
    } else if (CONFIG.zoomImage) {
      this.registerZoomImage()      // 使用原生图片缩放功能
    }
  }

  // 执行初始化：启动所有配置的主题功能
  Stun.utils.pjaxReloadBoot()
})