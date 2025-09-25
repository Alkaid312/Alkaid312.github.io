/** 
 * 头部导航交互功能模块
 * 
 * 功能概述：
 * - 响应式导航菜单（移动端汉堡菜单 / 桌面端水平菜单）
 * - 多级子菜单交互（手风琴效果 / 悬停效果）
 * - 夜间模式切换（支持Cookie记忆状态）
 * - 滚动指示器功能
 * - PJAX无刷新加载兼容
 * 
 * 技术特性：
 * - 使用Velocity.js实现流畅动画
 * - 完善的冒泡控制和状态管理
 * - 节流优化防止性能问题
 * - 响应式设计适配多端
 * 
 * 文件依赖：
 * - Velocity.js (动画库)
 * - jQuery (DOM操作)
 * - Stun.utils (主题工具函数)
 * 
 */

$(document).ready(function () {
  // ================================
  // 变量定义区
  // ================================
  
  /** @type {jQuery} 菜单按钮元素（移动端汉堡按钮） */
  var $menuBtn = $('.header-nav-menubtn');
  
  /** @type {jQuery} 主导航菜单容器 */
  var $menu = $('.header-nav-menu');
  
  /** @type {jQuery} 一级菜单项集合 */
  var $menuItem = $('.header-nav-menu-item');
  
  /** @type {jQuery} 二级子菜单集合 */
  var $submenu = $('.header-nav-submenu');
  
  /** @type {boolean} 当前是否为移动端视图 */
  var isMobile = $menuBtn.is(':visible');
  
  /** @type {boolean} 主导航菜单显示状态 */
  var isMenuShow = false;
  
  /** @type {boolean} 子菜单展开状态 */
  var isSubmenuShow = false;
  
  /** @type {boolean} 夜间模式按钮焦点状态 */
  var isNightModeFocus = true;
  
  /** @type {jQuery} 夜间模式切换按钮 */
  var $nightMode = $('.mode');

  // ================================
  // 工具函数区
  // ================================

  /**
   * 重置菜单高度 - 用于收起展开的子菜单
   * @function resetMenuHeight
   * @description 将菜单项恢复原始高度并隐藏子菜单
   */
  function resetMenuHeight() {
    $menuItem.velocity(
      {
        height: $menuItem.outerHeight()  // 恢复为原始高度
      },
      {
        complete: function () {
          // 动画完成后完全隐藏子菜单
          $submenu.css({ 
            display: 'none', 
            opacity: 0 
          });
        }
      }
    );
  }

  /**
   * 获取夜间模式状态
   * @function getNightMode
   * @returns {boolean} 当前是否为夜间模式
   */
  function getNightMode() {
    var nightMode = false;
    try {
      // 从Cookie中读取夜间模式设置
      if (parseInt(Stun.utils.Cookies().get(NIGHT_MODE_COOKIES_KEY))) {
        nightMode = true;
      }
    } catch (err) {
      // Cookie读取失败时静默处理，使用默认值
      console.warn('夜间模式Cookie读取失败:', err);
    }
    return nightMode;
  }

  // ================================
  // 事件监听区
  // ================================

  /**
   * 窗口大小改变监听 - 响应式适配
   */
  $(window).on(
    'resize',
    Stun.utils.throttle(function () {
      // 重新检测屏幕尺寸
      isMobile = $menuBtn.is(':visible');
      
      if (isMobile) {
        // 移动端模式
        $submenu.removeClass('hide--force');
        
        // 如果子菜单展开，则自动收起
        if (isSubmenuShow) {
          resetMenuHeight();
          isSubmenuShow = false;
        }
      } else {
        // 桌面端模式 - 直接隐藏子菜单
        $submenu.css({ 
          display: 'none', 
          opacity: 0 
        });
      }
    }, 200)  // 节流控制：200ms内只执行一次
  );

  /**
   * 文档点击事件 - 全局菜单收起
   */
  $(document).on('click', function () {
    // 如果菜单可见，则点击页面其他区域时收起
    if ($menu.is(':visible')) {
      // 移动端需要额外处理子菜单状态
      if (isMobile && isSubmenuShow) {
        resetMenuHeight();
        isSubmenuShow = false;
      }
      
      // 隐藏主导航
      $menu.css({ display: 'none' });
      isMenuShow = false;
    }
    
    // 移除夜间模式按钮的焦点状态
    if (isNightModeFocus) {
      $nightMode.removeClass('mode--focus');
      isNightModeFocus = false;
    }
  });

  // ================================
  // 功能初始化区
  // ================================

  /**
   * 头部导航功能初始化 - 支持PJAX重新加载
   * @function pjaxReloadHeader
   */
  Stun.utils.pjaxReloadHeader = function () {
    // PJAX加载后重新获取元素引用
    $menuBtn = $('.header-nav-menubtn');
    $menu = $('.header-nav-menu');
    $menuItem = $('.header-nav-menu-item');
    $submenu = $('.header-nav-submenu');
    isMobile = $menuBtn.is(':visible');

    // 重置状态变量
    isMenuShow = false;
    isSubmenuShow = false;

    // 夜间模式功能初始化
    if (CONFIG.nightMode && CONFIG.nightMode.enable) {
      initNightMode();
    }

    // 绑定菜单交互事件
    initMenuInteractions();
  };

  /**
   * 初始化夜间模式功能
   * @function initNightMode
   */
  function initNightMode() {
    var isNightMode = false;
    var NIGHT_MODE_COOKIES_KEY = 'night_mode';
    
    $nightMode = $('.mode');
    isNightModeFocus = true;

    // 初始化夜间模式状态
    if (getNightMode()) {
      $nightMode.addClass('mode--checked');
      $nightMode.addClass('mode--focus');
      $('html').addClass('nightmode');
      isNightMode = true;
    }

    // 夜间模式切换事件
    $('.mode').on('click', function (e) {
      e.stopPropagation();
      isNightMode = !isNightMode;
      isNightModeFocus = true;
      
      // 保存状态到Cookie
      Stun.utils.Cookies().set(NIGHT_MODE_COOKIES_KEY, isNightMode ? 1 : 0);
      
      // 切换UI状态
      $nightMode.toggleClass('mode--checked');
      $nightMode.addClass('mode--focus');
      $('html').toggleClass('nightmode');
    });
  }

  /**
   * 初始化菜单交互功能
   * @function initMenuInteractions
   */
  function initMenuInteractions() {
    // 菜单按钮点击事件
    initMenuButton();
    
    // 子菜单事件冒泡控制
    initSubmenuBubble();
    
    // 菜单项点击事件（移动端）
    initMenuItemClick();
    
    // 菜单项悬停事件（桌面端）
    initMenuItemHover();
  }

  /**
   * 初始化菜单按钮点击事件
   * @function initMenuButton
   */
  function initMenuButton() {
    $menuBtn.on('click', function (e) {
      e.stopPropagation();
      
      // 移动端处理子菜单状态
      if (isMobile && isMenuShow && isSubmenuShow) {
        resetMenuHeight();
        isSubmenuShow = false;
      }
      
      // 切换菜单显示状态
      isMenuShow = !isMenuShow;
      
      // 执行菜单显示/隐藏动画
      $menu.velocity('stop').velocity(
        {
          opacity: isMenuShow ? 1 : 0
        },
        {
          duration: isMenuShow ? 200 : 0,
          display: isMenuShow ? 'block' : 'none'
        }
      );
    });
  }

  /**
   * 初始化子菜单事件冒泡控制
   * @function initSubmenuBubble
   */
  function initSubmenuBubble() {
    var isBubbleInMenu = false;
    
    $('.header-nav-submenu-item').on('click', function () {
      isBubbleInMenu = true;
    });
  }

  /**
   * 初始化菜单项点击事件（移动端）
   * @function initMenuItemClick
   */
  function initMenuItemClick() {
    $menuItem.on('click', function (e) {
      if (!isMobile) return;
      
      var $submenu = $(this).find('.header-nav-submenu');
      if (!$submenu.length) return;
      
      // 事件冒泡控制
      if (!isBubbleInMenu) {
        e.stopPropagation();
      } else {
        isBubbleInMenu = false;
      }

      // 计算菜单高度
      var menuItemHeight = $menuItem.outerHeight();
      var submenuHeight = menuItemHeight + Math.floor($submenu.outerHeight()) * $submenu.length;
      var menuShowHeight = 0;

      // 判断展开/收起状态
      if ($(this).outerHeight() > menuItemHeight) {
        isSubmenuShow = false;
        menuShowHeight = menuItemHeight;
      } else {
        isSubmenuShow = true;
        menuShowHeight = submenuHeight;
      }
      
      // 显示子菜单并执行手风琴动画
      $submenu.css({ display: 'block', opacity: 1 });
      
      $(this)
        .velocity('stop')
        .velocity({ height: menuShowHeight }, { duration: 300 })
        .siblings()
        .velocity({ height: menuItemHeight }, { duration: 300 });
    });
  }

  /**
   * 初始化菜单项悬停事件（桌面端）
   * @function initMenuItemHover
   */
  function initMenuItemHover() {
    // 鼠标移入显示子菜单
    $menuItem.on('mouseenter', function () {
      if (isMobile) return;
      
      var $submenu = $(this).find('.header-nav-submenu');
      if (!$submenu.length || $submenu.is(':visible')) return;
      
      $submenu.removeClass('hide--force');
      $submenu
        .velocity('stop')
        .velocity('transition.slideUpIn', { duration: 200 });
    });

    // 鼠标移出隐藏子菜单
    $menuItem.on('mouseleave', function () {
      if (isMobile) return;
      
      var $submenu = $(this).find('.header-nav-submenu');
      if (!$submenu.length) return;
      
      $submenu.addClass('hide--force');
      isSubmenuShow = false;
    });
  }

  /**
   * 滚动指示器功能初始化
   * @function pjaxReloadScrollIcon
   */
  Stun.utils.pjaxReloadScrollIcon = function () {
    if (CONFIG.header && CONFIG.header.scrollDownIcon) {
      $('.header-banner-arrow').on('click', function (e) {
        e.stopPropagation();
        
        // 平滑滚动到内容区域（跳过头部高度）
        $('#container').velocity('scroll', {
          offset: $('#header').outerHeight()
        });
      });
    }
  };

  // ================================
  // 模块初始化
  // ================================
  
  // 执行初始化
  Stun.utils.pjaxReloadHeader();
  Stun.utils.pjaxReloadScrollIcon();
});