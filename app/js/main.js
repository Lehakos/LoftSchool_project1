$(function() {

  $('.js-popup-open').on('click', function(e) {

    var
        $this = $(this),
        $popupId = $this.data('popup'),
        $popup = $('#' + $popupId);

    e.preventDefault();

    if (!$popup.hasClass('popup_open')) {
      $popup
        .addClass('popup_open')
        .fadeIn();

      $('html').addClass('no-scroll');
      toggleScrollBar('html');
    }

  });

  $('.popup').on('click', function(e) {

    var
      $this = $(this),
      $target = $(e.target),
      $close = $target.closest('.js-popup-close'),
      $content = $target.closest('.popup__content');

    if ($close.length || !$content.length) {
      $this
        .removeClass('popup_open')
        .fadeOut('slow', function() {
          $('html').removeClass('no-scroll');
          toggleScrollBar('html');
      });
    }

  });

  function measureScrollBarWidth() {
    var div = document.createElement('div');

    div.style.overflowY = 'scroll';
    div.style.width = '50px';
    div.style.height = '50px';

    // при display:none размеры нельзя узнать
    // нужно, чтобы элемент был видим,
    // visibility:hidden - можно, т.к. сохраняет геометрию
    div.style.visibility = 'hidden';

    document.body.appendChild(div);
    var scrollWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);

    return scrollWidth;
  }

  function toggleScrollBar(selector) {

    var
      scrollBarWidth = measureScrollBarWidth(),
      $elem = $(selector);

    console.log(selector)

    if ($elem.hasClass('no-scroll')) {
      $elem.css({
        'padding-right': scrollBarWidth + 'px'
      });

    } else {

      $elem.css({
        'padding-right': ''
      });
    }


  }

});
