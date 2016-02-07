//=============================================
// APP MODULE
//=============================================

var app = (function() {

    // Функция инициализации
    var init = function() {
        _setupListeners();
    };

    // Прослушивает события
    var _setupListeners = function() {
        _setupPopups();
    };

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

        var $popupForm = $popup.find('form');

        $popup
            .removeClass('popup_open')
            .fadeOut('slow', function() {
                $('html').removeClass('no-scroll');
                toggleScrollBar('html');
        });

        if ($popupForm.length) {

            $popupForm.get(0).reset();

        }

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

//=============================================
// FORMS MODULE
//=============================================

var formsModule = (function() {

    // Функция инициализации
    var init = function() {
        _setupListeners();
        _styleInputFile();
        _addPlaceholdersToOldBrowsers();
        _setupTooltip();
    }

    // В этой функции запускаются все обработчики событий
    var _setupListeners = function() {
        _setupForms();
    };

    // Функция для валидации полей форм
    var validateFields = function($validationFields) {

        var valid = true;

        $validationFields.each(function() {

            var $this = $(this);

            var validateThis = function() {
                validateFields($this);
            }

            if (!$this.val()) {
                if ($this.hasClass('valid')) {
                    $this.removeClass('valid');
                }

                $this
                    .addClass('invalid')
                    .trigger('validationFail')

                // Если поле не прошло валидацию, вешаем на него обработчик
                // который будет валидировать поле при введении в нем символов
                // или при изменении его значения
                $this.on('change keyup', validateThis);

                valid = false;

            } else {

                if ($this.hasClass('invalid')) {
                    $this
                        .toggleClass('invalid valid')
                        .trigger('validation');
                }

                // если поле прошло валидацию, то убираем с него персональную валидацию
                $this.off('change keypress', validateThis);
            }

        });

        return valid;
    };

    // настраиваем тултипы для полей формы
    var _setupTooltip = function() {

        // ищем все поля с атрибутом required
        var $form = $('form'),
            $requiredFields = $form.find('[required]');

        if ($requiredFields.length) {

            $requiredFields.each(function() {

                var $this = $(this),
                    $text = $this.data('tooltip-text') || 'Пожалуйста, заполните это поле',
                    $dataPosition = $this.data('tooltip-pos'),
                    position = {};

                // устанавливаем позицию тултипа в зависимости от содержимого data-tooltip-pos
                position.my = $dataPosition === 'left' ? 'center right' : 'center left';
                position.at = $dataPosition === 'left' ? 'center left' : 'center right';
                // если текущее поле является скрытым input[type="file"], то позиционируем тултип
                // относительно родительского блока
                position.target = $this.hasClass('input-file__hidden') ? $this.parent() : $this;

                $this.qtip({
                    content: {
                        text: $text
                    },
                    position: {
                        my: position.my,
                        at: position.at,
                        target: position.target,
                        container: $form
                    },
                    show: {
                        event: 'validationFail' // тултип будет показан на кастомное событие validationFail
                    },
                    hide: {
                        event: 'validation hideTooltip' // тултип будет спрятан на кастомное событие validation
                    },
                    style: {
                        classes: 'qtip-rounded tooltip'
                    }
                });

            });

        }

    }

    // удаляет с элементов формы классы, добавленные при валидации
    // а также скрывает тултипы
    var removeValidation = function($form) {

        var $fields = $form.find(':input');

        $fields
            .removeClass('invalid valid')
            .trigger('hideTooltip');

    };

    // Функция AJAX отправки формы
    // В начале функция валидирует форму,

    // затем отправляет данные из формы на указанный url
    var ajaxForm = function($form, url) {

        // получаем все поля формы, ищем среди них те,
        // у которых есть атрибут required и валидируем их
        var $formFields = $form.find(':input'),
            $requiredFields = $formFields.filter('[required]'),
            valid = validateFields($requiredFields);

        if (!valid) {
            return false;
        }

        var data = $form.serializeArray();

        var result = $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: data
        });

        return result;

    };

    // Добавляет всем формам атрибут novalidate для отмены браузерной валидации
    // и вешает обработчик на submit
    var _setupForms = function() {

        var $form = $('.form');

        if ($form.length) {
            $form.attr('novalidate', '');

            $form.on('submit', _submitForm);
            $form.on('reset hide', _resetForm);
        }

    }

    // функция-обработчик события сабмит формы
    var _submitForm = function(e) {

        var $this = $(this);

        e.preventDefault();

        ajaxForm($this);

    }

    // функция-обработчик события reset формы
    var _resetForm = function() {

        var $this = $(this),
            $inputFile = $(this).find('.input-file');

        if ($inputFile.length) {

            $inputFile.each(function() {

                var $this = $(this),
                    $hiddenInput = $this.find('.input-file__hidden'),
                    $hiddenInputVal = $hiddenInput.val();

                if ($hiddenInputVal) {
                    $hiddenInput
                        .val('')
                        .trigger('change');
                }

            });
        }

        removeValidation($this);

    }

    // Добавляем название загруженного пользователем файла в кастомный input[type="file"]
    var _styleInputFile = function() {

        var $inputFile = $('.input-file');

        if ($inputFile.length) {

            $inputFile.each(function() {

                var $this = $(this),
                    $textContainer = $this.find('.input-file__text'),
                    $defaultVal = $textContainer.text(),
                    $hiddenInput = $this.find('.input-file__hidden');

                $hiddenInput.on('change', function(e) {

                    var fileName = e.target.value.split('\\').pop();

                    console.log(fileName)

                    if(fileName) {
                        $textContainer.text(fileName);

                        if (!$this.hasClass('input-file_non-empty')) {
                            $this.addClass('input-file_non-empty');
                        }

                    } else {

                        $textContainer.text($defaultVal);

                        if ($this.hasClass('input-file_non-empty')) {
                            $this.removeClass('input-file_non-empty');
                        }
                    }

                });

            });

        }

    }

    // Добавляем placeholder в те браузеры, где он не поддерживается
    var _addPlaceholdersToOldBrowsers = function() {

        if ($('input, textarea').length) {
            $('input, textarea').placeholder();
        }

    };

    return {
        init: init,
        validateFields: validateFields,
        removeValidation: removeValidation,
        ajaxForm: ajaxForm
    }

})();

$(function() {

    app.init();
    formsModule.init();

});
