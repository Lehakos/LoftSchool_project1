var app = (function() {

    // Функция инициализации
    var init = function() {
        _setupListeners();
        _addPlaceholdersToOldBrowsers();
        _styleInputFile();
    };

    // Прослушивает события
    var _setupListeners = function() {
        _setupPopups();
    };

    // Добавляем placeholder в те браузеры, где он не поддерживается
    var _addPlaceholdersToOldBrowsers = function() {

        if ($('input, textarea').length) {
            $('input, textarea').placeholder();
        }

    };

    // Стилизация input[type="file"]
    var _styleInputFile = function() {

        var inputFile = $('.input-file');

        if (inputFile.length) {

            inputFile.each( function() {

                var $this = $(this),
                    $defaultVal = $this.text(),
                    $textContainer = $this.find('.input-file__text'),
                    $hiddenInput = $this.find('.input-file__hidden');

                // Добавляем название выбранного файла в муляж инпута
                $hiddenInput.on('change', function(e) {

                    var fileName = e.target.value.split('\\').pop();

                    if(fileName) {
                        $textContainer.text(fileName);

                        if (!$this.hasClass('input-file_non-empty')) {
                            $this.addClass('input-file_non-empty');
                        }
                    }

                });

            });

        }

    }

    // Работа с попапами
    var _setupPopups = function() {

        var $openPopupBtns = $('.js-popup-open'),
            $popups = $('.popup');

        // Открытие попапа по клику на вызывющую его кнопку
        var openPopup = function(e) {

            var $this = $(this),
                $popupId = $this.data('popup'),
                $popup = $('#' + $popupId);

            e.preventDefault();

            showPopup($popup);

        }

        // Закрытие попапа при нажатии на кнопку закрыть или на оверлей
        var closePopup = function(e) {

            var $this = $(this),
                $target = $(e.target),
                $closeBtn = $target.closest('.js-popup-close'),
                $content = $target.closest('.popup__content');

            if ($closeBtn.length || !$content.length) {
                e.preventDefault();
                hidePopup($this);
            }

        }

        $openPopupBtns.on('click', openPopup);
        $popups.on('click', closePopup);

    }

    // Показать попап
    var showPopup = function($popup) {

        if (!$popup.hasClass('popup_open')) {
            $popup
                .addClass('popup_open')
                .fadeIn();

            $('html').addClass('no-scroll');
            toggleScrollBar('html');
        }

    };

    // Скрыть попап
    var hidePopup = function($popup) {

        $popup
            .removeClass('popup_open')
            .fadeOut('slow', function() {
                $('html').removeClass('no-scroll');
                toggleScrollBar('html');
        });

    };

    // узнать ширину скроллбара в данном браузере
    var _measureScrollBarWidth = function() {

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

    // Спрятать или показать скроллбар
    var toggleScrollBar = function(selector) {

        var scrollBarWidth = _measureScrollBarWidth(),
            $elem = $(selector);

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

    return {
        init: init,
        showPopup: showPopup,
        hidePopup: hidePopup,
        toggleScrollBar: toggleScrollBar
    }

})();

$(function() {

    app.init();

});
