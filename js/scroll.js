/**   
 * 1.智能导航栏控制
 * 向下滚动时隐藏导航栏（节省屏幕空间）
 * 向上滚动时显示导航栏（方便导航）
 * 页面顶部时完全显示导航栏
 * 
 * 2.返回顶部按钮
 * 滚动后自动显示按钮
 * 点击平滑返回顶部
 * 顶部时自动隐藏
 */

$(document).ready(function () {
  // ================================
  // 变量定义区
  // ================================
  
  /** @type {boolean} 是否启用头部导航 */
  var isHeaderEnable = CONFIG.header && CONFIG.header.enable;
  
  /** @type {boolean} 是否在文章页面显示头部导航 */
  var isShowHeaderOnPost = isHeaderEnable && CONFIG.header.showOnPost;
  
  /** @type {number} 上一次滚动时页面距离顶部的距离 */
  var prevScrollTop = 0;
  
  /** @type {boolean} 导航栏是否处于固定状态 */
  var isNavFix = false;
  
  /** @type {boolean} 是否允许执行导航栏动画 */
  var isAnimation = true;

  // ================================
  // 头部导航滚动控制函数
  // ================================

  /**
   * 头部导航栏滚动控制函数
   * @function headerNavScroll
   * @description 根据页面滚动方向控制导航栏的显示/隐藏和动画效果
   */
  function headerNavScroll() {
    /** @type {boolean} 当前是否为文章页面 */
    var isPostPage = !!$('#is-post').length;
    
    /** @type {boolean} 是否不显示头部导航 */
    var isNoHeader = !isHeaderEnable || (isPostPage && !isShowHeaderOnPost);
    
    /** @type {jQuery} 头部导航元素 */
    var $headerNav = $('.header-nav');
    
    /** @type {number} 当前滚动距离顶部的位置 */
    var scrollTop = Math.floor($(window).scrollTop());
    
    /** @type {number} 与上一次滚动的差值（正数向下，负数向上） */
    var delta = Math.floor(scrollTop - prevScrollTop);

    // 情况1：页面处于顶部（scrollTop = 0）
    if (scrollTop === 0) {
      if (isNoHeader) {
        // 无头部导航时，添加透明效果
        setTimeout(function () {
          $headerNav.addClass('slider--clear');
          isAnimation = false;
        }, 200);
      }
      // 移除固定状态，显示导航栏
      $headerNav.removeClass('header-nav--sticky');
      $headerNav.removeClass('slider--up');
      $headerNav.addClass('slider--down');
    } 
    // 情况2：页面已滚动（scrollTop > 0）
    else {
      // 无头部导航且滚动距离小于导航栏高度时，不进行处理
      if (isNoHeader && scrollTop < $headerNav.height()) {
        return false;
      }

      /** @type {number} 触发导航栏状态变化的最小滚动距离 */
      var MIN_SCROLL_TO_CHANGE_NAV = 5;
      
      // 只有当滚动距离超过阈值时才改变导航栏状态（避免微小滚动导致的频繁变化）
      if (Math.abs(delta) > MIN_SCROLL_TO_CHANGE_NAV) {
        // 处理无头部导航的情况
        if (isNoHeader) {
          if (!isAnimation) {
            isAnimation = true;
          } else {
            $headerNav.removeClass('slider--clear');
          }
        }
        
        // 设置导航栏固定状态
        if (!isNavFix) {
          isNavFix = true;
        } else {
          $headerNav.addClass('header-nav--sticky');
        }
        
        // 根据滚动方向应用不同的动画类
        if (delta > 0) {
          // 向下滚动：隐藏导航栏（向上滑动）
          $headerNav.removeClass('slider--down');
          $headerNav.addClass('slider--up');
        } else {
          // 向上滚动：显示导航栏（向下滑动）
          $headerNav.removeClass('slider--up');
          $headerNav.addClass('slider--down');
        }
      } else {
        // 微小滚动时保持导航栏固定状态
        $headerNav.addClass('header-nav--sticky');
      }
    }
    
    // 更新上一次的滚动位置
    prevScrollTop = scrollTop;
  }

  // ================================
  // 返回顶部功能
  // ================================

  /** @type {boolean} 是否启用返回顶部功能 */
  var isBack2topEnable = CONFIG.back2top && CONFIG.back2top.enable;
  
  /** @type {boolean} 返回顶部按钮是否显示 */
  var isBack2topShow = false;

  /**
   * 返回顶部按钮控制函数
   * @function back2top
   * @description 根据滚动位置控制返回顶部按钮的显示/隐藏
   */
  function back2top() {
    /** @type {jQuery} 返回顶部按钮元素 */
    var $back2top = $('#back2top');
    
    /** @type {number} 当前滚动距离 */
    var scrollTop = $(window).scrollTop();

    if (scrollTop !== 0) {
      // 已滚动：显示返回顶部按钮
      if (!isBack2topShow) {
        $back2top.addClass('back2top--show');
        $back2top.removeClass('back2top--hide');
        isBack2topShow = true;
      }
    } else {
      // 处于顶部：隐藏返回顶部按钮
      $back2top.addClass('back2top--hide');
      $back2top.removeClass('back2top--show');
      isBack2topShow = false;
    }
  }

  // ================================
  // 返回顶部功能初始化
  // ================================

  if (isBack2topEnable) {
    // 初始状态检查
    back2top();

    // 绑定返回顶部按钮点击事件
    $('#back2top').on('click', function () {
      // 使用velocity.js实现平滑滚动到顶部
      $('body')
        .velocity('stop')  // 停止当前动画
        .velocity('scroll'); // 滚动到顶部
    });
  }

  // ================================
  // 事件监听与初始化
  // ================================

  // 初始执行一次导航栏滚动控制
  headerNavScroll();

  // 监听窗口滚动事件（使用节流函数优化性能）
  $(window).on(
    'scroll',
    Stun.utils.throttle(function () {
      // 滚动时更新导航栏状态
      headerNavScroll();

      // 如果启用返回顶部功能，更新按钮状态
      if (isBack2topEnable) {
        back2top();
      }
    }, 100)  // 节流间隔：100毫秒
  );
});