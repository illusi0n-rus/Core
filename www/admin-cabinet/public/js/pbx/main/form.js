"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl, globalTranslate */
var Form = {
  $formObj: '',
  validateRules: {},
  url: '',
  cbBeforeSendForm: '',
  cbAfterSendForm: '',
  $submitButton: $('#submitbutton'),
  $dropdownSubmit: $('#dropdownSubmit'),
  $submitModeInput: $('input[name="submitMode"]'),
  processData: true,
  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
  keyboardShortcuts: true,
  enableDirrity: true,
  oldFormValues: [],
  initialize: function () {
    function initialize() {
      if (Form.enableDirrity) Form.initializeDirrity();
      Form.$submitButton.on('click', function (e) {
        e.preventDefault();
        if (Form.$submitButton.hasClass('loading')) return;
        if (Form.$submitButton.hasClass('disabled')) return;
        Form.$formObj.form({
          on: 'blur',
          fields: Form.validateRules,
          onSuccess: function () {
            function onSuccess() {
              Form.submitForm();
            }

            return onSuccess;
          }(),
          onFailure: function () {
            function onFailure() {
              Form.$formObj.removeClass('error').addClass('error');
            }

            return onFailure;
          }()
        });
        Form.$formObj.form('validate form');
      });

      if (Form.$dropdownSubmit.length > 0) {
        Form.$dropdownSubmit.dropdown({
          onChange: function () {
            function onChange(value) {
              var translateKey = "bt_".concat(value);
              Form.$submitModeInput.val(value);
              Form.$submitButton.html("<i class=\"save icon\"></i> ".concat(globalTranslate[translateKey])).click();
            }

            return onChange;
          }()
        });
      }

      Form.$formObj.on('submit', function (e) {
        e.preventDefault();
      });
    }

    return initialize;
  }(),

  /**
   * Инициализация отслеживания изменений формы
   */
  initializeDirrity: function () {
    function initializeDirrity() {
      Form.saveInitialValues();
      Form.setEvents();
      Form.$submitButton.addClass('disabled');
      Form.$dropdownSubmit.addClass('disabled');
    }

    return initializeDirrity;
  }(),

  /**
   * Сохраняет первоначальные значения для проверки на изменения формы
   */
  saveInitialValues: function () {
    function saveInitialValues() {
      Form.oldFormValues = Form.$formObj.form('get values');
    }

    return saveInitialValues;
  }(),

  /**
   * Запускает обработчики изменения объектов формы
   */
  setEvents: function () {
    function setEvents() {
      Form.$formObj.find('input, select').change(function () {
        Form.checkValues();
      });
      Form.$formObj.find('input, textarea').on('keyup keydown blur', function () {
        Form.checkValues();
      });
      Form.$formObj.find('.ui.checkbox').on('click', function () {
        Form.checkValues();
      });
    }

    return setEvents;
  }(),

  /**
   * Сверяет изменения старых и новых значений формы
   */
  checkValues: function () {
    function checkValues() {
      var newFormValues = Form.$formObj.form('get values');

      if (JSON.stringify(Form.oldFormValues) === JSON.stringify(newFormValues)) {
        Form.$submitButton.addClass('disabled');
        Form.$dropdownSubmit.addClass('disabled');
      } else {
        Form.$submitButton.removeClass('disabled');
        Form.$dropdownSubmit.removeClass('disabled');
      }
    }

    return checkValues;
  }(),

  /**
   * Отправка формы на сервер
   */
  submitForm: function () {
    function submitForm() {
      $.api({
        url: Form.url,
        on: 'now',
        method: 'POST',
        processData: Form.processData,
        contentType: Form.contentType,
        keyboardShortcuts: Form.keyboardShortcuts,
        beforeSend: function () {
          function beforeSend(settings) {
            Form.$submitButton.addClass('loading');
            var cbBeforeSendResult = Form.cbBeforeSendForm(settings);

            if (cbBeforeSendResult === false) {
              Form.$submitButton.transition('shake').removeClass('loading');
            } else {
              $.each(cbBeforeSendResult.data, function (index, value) {
                if (index.indexOf('ecret') > -1 || index.indexOf('assword') > -1) return;
                if (typeof value === 'string') cbBeforeSendResult.data[index] = value.trim();
              });
            }

            return cbBeforeSendResult;
          }

          return beforeSend;
        }(),
        onSuccess: function () {
          function onSuccess(response) {
            $('.ui.message.ajax').remove();
            $.each(response.message, function (index, value) {
              if (index === 'error') {
                Form.$submitButton.transition('shake').removeClass('loading');
                Form.$formObj.after("<div class=\"ui ".concat(index, " message ajax\">").concat(value, "</div>"));
              }
            });
            var event = document.createEvent('Event');
            event.initEvent('ConfigDataChanged', false, true);
            window.dispatchEvent(event);
            Form.cbAfterSendForm(response);

            if (response.success && response.reload.length > 0 && Form.$submitModeInput.val() === 'SaveSettings') {
              window.location = globalRootUrl + response.reload;
            } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndAddNew') {
              var emptyUrl = window.location.href.split('modify');

              if (emptyUrl.length > 1) {
                window.location = "".concat(emptyUrl[0], "modify/");
              }
            } else if (response.success && Form.$submitModeInput.val() === 'SaveSettingsAndExit') {
              var _emptyUrl = window.location.href.split('modify');

              if (_emptyUrl.length > 1) {
                window.location = "".concat(_emptyUrl[0]);
              }
            } else if (response.success && response.reload.length > 0) {
              window.location = globalRootUrl + response.reload;
            } else if (Form.enableDirrity) {
              Form.initializeDirrity();
            }

            Form.$submitButton.removeClass('loading');
          }

          return onSuccess;
        }(),
        onFailure: function () {
          function onFailure(response) {
            Form.$formObj.after(response);
            Form.$submitButton.transition('shake').removeClass('loading');
          }

          return onFailure;
        }()
      });
    }

    return submitForm;
  }()
}; // export default Form;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2Zvcm0uanMiXSwibmFtZXMiOlsiRm9ybSIsIiRmb3JtT2JqIiwidmFsaWRhdGVSdWxlcyIsInVybCIsImNiQmVmb3JlU2VuZEZvcm0iLCJjYkFmdGVyU2VuZEZvcm0iLCIkc3VibWl0QnV0dG9uIiwiJCIsIiRkcm9wZG93blN1Ym1pdCIsIiRzdWJtaXRNb2RlSW5wdXQiLCJwcm9jZXNzRGF0YSIsImNvbnRlbnRUeXBlIiwia2V5Ym9hcmRTaG9ydGN1dHMiLCJlbmFibGVEaXJyaXR5Iiwib2xkRm9ybVZhbHVlcyIsImluaXRpYWxpemUiLCJpbml0aWFsaXplRGlycml0eSIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiaGFzQ2xhc3MiLCJmb3JtIiwiZmllbGRzIiwib25TdWNjZXNzIiwic3VibWl0Rm9ybSIsIm9uRmFpbHVyZSIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJsZW5ndGgiLCJkcm9wZG93biIsIm9uQ2hhbmdlIiwidmFsdWUiLCJ0cmFuc2xhdGVLZXkiLCJ2YWwiLCJodG1sIiwiZ2xvYmFsVHJhbnNsYXRlIiwiY2xpY2siLCJzYXZlSW5pdGlhbFZhbHVlcyIsInNldEV2ZW50cyIsImZpbmQiLCJjaGFuZ2UiLCJjaGVja1ZhbHVlcyIsIm5ld0Zvcm1WYWx1ZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiYXBpIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiY2JCZWZvcmVTZW5kUmVzdWx0IiwidHJhbnNpdGlvbiIsImVhY2giLCJkYXRhIiwiaW5kZXgiLCJpbmRleE9mIiwidHJpbSIsInJlc3BvbnNlIiwicmVtb3ZlIiwibWVzc2FnZSIsImFmdGVyIiwiZXZlbnQiLCJkb2N1bWVudCIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50Iiwid2luZG93IiwiZGlzcGF0Y2hFdmVudCIsInN1Y2Nlc3MiLCJyZWxvYWQiLCJsb2NhdGlvbiIsImdsb2JhbFJvb3RVcmwiLCJlbXB0eVVybCIsImhyZWYiLCJzcGxpdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFRQTtBQUVBLElBQU1BLElBQUksR0FBRztBQUNaQyxFQUFBQSxRQUFRLEVBQUUsRUFERTtBQUVaQyxFQUFBQSxhQUFhLEVBQUUsRUFGSDtBQUdaQyxFQUFBQSxHQUFHLEVBQUUsRUFITztBQUlaQyxFQUFBQSxnQkFBZ0IsRUFBRSxFQUpOO0FBS1pDLEVBQUFBLGVBQWUsRUFBRSxFQUxMO0FBTVpDLEVBQUFBLGFBQWEsRUFBRUMsQ0FBQyxDQUFDLGVBQUQsQ0FOSjtBQU9aQyxFQUFBQSxlQUFlLEVBQUVELENBQUMsQ0FBQyxpQkFBRCxDQVBOO0FBUVpFLEVBQUFBLGdCQUFnQixFQUFFRixDQUFDLENBQUMsMEJBQUQsQ0FSUDtBQVNaRyxFQUFBQSxXQUFXLEVBQUUsSUFURDtBQVVaQyxFQUFBQSxXQUFXLEVBQUUsa0RBVkQ7QUFXWkMsRUFBQUEsaUJBQWlCLEVBQUUsSUFYUDtBQVlaQyxFQUFBQSxhQUFhLEVBQUUsSUFaSDtBQWFaQyxFQUFBQSxhQUFhLEVBQUUsRUFiSDtBQWNaQyxFQUFBQSxVQWRZO0FBQUEsMEJBY0M7QUFDWixVQUFJZixJQUFJLENBQUNhLGFBQVQsRUFBd0JiLElBQUksQ0FBQ2dCLGlCQUFMO0FBRXhCaEIsTUFBQUEsSUFBSSxDQUFDTSxhQUFMLENBQW1CVyxFQUFuQixDQUFzQixPQUF0QixFQUErQixVQUFDQyxDQUFELEVBQU87QUFDckNBLFFBQUFBLENBQUMsQ0FBQ0MsY0FBRjtBQUNBLFlBQUluQixJQUFJLENBQUNNLGFBQUwsQ0FBbUJjLFFBQW5CLENBQTRCLFNBQTVCLENBQUosRUFBNEM7QUFDNUMsWUFBSXBCLElBQUksQ0FBQ00sYUFBTCxDQUFtQmMsUUFBbkIsQ0FBNEIsVUFBNUIsQ0FBSixFQUE2QztBQUM3Q3BCLFFBQUFBLElBQUksQ0FBQ0MsUUFBTCxDQUNFb0IsSUFERixDQUNPO0FBQ0xKLFVBQUFBLEVBQUUsRUFBRSxNQURDO0FBRUxLLFVBQUFBLE1BQU0sRUFBRXRCLElBQUksQ0FBQ0UsYUFGUjtBQUdMcUIsVUFBQUEsU0FISztBQUFBLGlDQUdPO0FBQ1h2QixjQUFBQSxJQUFJLENBQUN3QixVQUFMO0FBQ0E7O0FBTEk7QUFBQTtBQU1MQyxVQUFBQSxTQU5LO0FBQUEsaUNBTU87QUFDWHpCLGNBQUFBLElBQUksQ0FBQ0MsUUFBTCxDQUFjeUIsV0FBZCxDQUEwQixPQUExQixFQUFtQ0MsUUFBbkMsQ0FBNEMsT0FBNUM7QUFDQTs7QUFSSTtBQUFBO0FBQUEsU0FEUDtBQVdBM0IsUUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWNvQixJQUFkLENBQW1CLGVBQW5CO0FBQ0EsT0FoQkQ7O0FBaUJBLFVBQUlyQixJQUFJLENBQUNRLGVBQUwsQ0FBcUJvQixNQUFyQixHQUE4QixDQUFsQyxFQUFxQztBQUNwQzVCLFFBQUFBLElBQUksQ0FBQ1EsZUFBTCxDQUFxQnFCLFFBQXJCLENBQThCO0FBQzdCQyxVQUFBQSxRQUFRO0FBQUUsOEJBQUNDLEtBQUQsRUFBVztBQUNwQixrQkFBTUMsWUFBWSxnQkFBU0QsS0FBVCxDQUFsQjtBQUNBL0IsY0FBQUEsSUFBSSxDQUFDUyxnQkFBTCxDQUFzQndCLEdBQXRCLENBQTBCRixLQUExQjtBQUNBL0IsY0FBQUEsSUFBSSxDQUFDTSxhQUFMLENBQ0U0QixJQURGLHVDQUNvQ0MsZUFBZSxDQUFDSCxZQUFELENBRG5ELEdBRUVJLEtBRkY7QUFHQTs7QUFOTztBQUFBO0FBRHFCLFNBQTlCO0FBU0E7O0FBQ0RwQyxNQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FBY2dCLEVBQWQsQ0FBaUIsUUFBakIsRUFBMkIsVUFBQ0MsQ0FBRCxFQUFPO0FBQ2pDQSxRQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQSxPQUZEO0FBR0E7O0FBaERXO0FBQUE7O0FBaURaOzs7QUFHQUgsRUFBQUEsaUJBcERZO0FBQUEsaUNBb0RRO0FBQ25CaEIsTUFBQUEsSUFBSSxDQUFDcUMsaUJBQUw7QUFDQXJDLE1BQUFBLElBQUksQ0FBQ3NDLFNBQUw7QUFDQXRDLE1BQUFBLElBQUksQ0FBQ00sYUFBTCxDQUFtQnFCLFFBQW5CLENBQTRCLFVBQTVCO0FBQ0EzQixNQUFBQSxJQUFJLENBQUNRLGVBQUwsQ0FBcUJtQixRQUFyQixDQUE4QixVQUE5QjtBQUNBOztBQXpEVztBQUFBOztBQTBEWjs7O0FBR0FVLEVBQUFBLGlCQTdEWTtBQUFBLGlDQTZEUTtBQUNuQnJDLE1BQUFBLElBQUksQ0FBQ2MsYUFBTCxHQUFxQmQsSUFBSSxDQUFDQyxRQUFMLENBQWNvQixJQUFkLENBQW1CLFlBQW5CLENBQXJCO0FBQ0E7O0FBL0RXO0FBQUE7O0FBZ0VaOzs7QUFHQWlCLEVBQUFBLFNBbkVZO0FBQUEseUJBbUVBO0FBQ1h0QyxNQUFBQSxJQUFJLENBQUNDLFFBQUwsQ0FBY3NDLElBQWQsQ0FBbUIsZUFBbkIsRUFBb0NDLE1BQXBDLENBQTJDLFlBQU07QUFDaER4QyxRQUFBQSxJQUFJLENBQUN5QyxXQUFMO0FBQ0EsT0FGRDtBQUdBekMsTUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWNzQyxJQUFkLENBQW1CLGlCQUFuQixFQUFzQ3RCLEVBQXRDLENBQXlDLG9CQUF6QyxFQUErRCxZQUFNO0FBQ3BFakIsUUFBQUEsSUFBSSxDQUFDeUMsV0FBTDtBQUNBLE9BRkQ7QUFHQXpDLE1BQUFBLElBQUksQ0FBQ0MsUUFBTCxDQUFjc0MsSUFBZCxDQUFtQixjQUFuQixFQUFtQ3RCLEVBQW5DLENBQXNDLE9BQXRDLEVBQStDLFlBQU07QUFDcERqQixRQUFBQSxJQUFJLENBQUN5QyxXQUFMO0FBQ0EsT0FGRDtBQUdBOztBQTdFVztBQUFBOztBQThFWjs7O0FBR0FBLEVBQUFBLFdBakZZO0FBQUEsMkJBaUZFO0FBQ2IsVUFBTUMsYUFBYSxHQUFHMUMsSUFBSSxDQUFDQyxRQUFMLENBQWNvQixJQUFkLENBQW1CLFlBQW5CLENBQXRCOztBQUNBLFVBQUlzQixJQUFJLENBQUNDLFNBQUwsQ0FBZTVDLElBQUksQ0FBQ2MsYUFBcEIsTUFBdUM2QixJQUFJLENBQUNDLFNBQUwsQ0FBZUYsYUFBZixDQUEzQyxFQUEwRTtBQUN6RTFDLFFBQUFBLElBQUksQ0FBQ00sYUFBTCxDQUFtQnFCLFFBQW5CLENBQTRCLFVBQTVCO0FBQ0EzQixRQUFBQSxJQUFJLENBQUNRLGVBQUwsQ0FBcUJtQixRQUFyQixDQUE4QixVQUE5QjtBQUNBLE9BSEQsTUFHTztBQUNOM0IsUUFBQUEsSUFBSSxDQUFDTSxhQUFMLENBQW1Cb0IsV0FBbkIsQ0FBK0IsVUFBL0I7QUFDQTFCLFFBQUFBLElBQUksQ0FBQ1EsZUFBTCxDQUFxQmtCLFdBQXJCLENBQWlDLFVBQWpDO0FBQ0E7QUFDRDs7QUExRlc7QUFBQTs7QUEyRlo7OztBQUdBRixFQUFBQSxVQTlGWTtBQUFBLDBCQThGQztBQUNaakIsTUFBQUEsQ0FBQyxDQUFDc0MsR0FBRixDQUFNO0FBQ0wxQyxRQUFBQSxHQUFHLEVBQUVILElBQUksQ0FBQ0csR0FETDtBQUVMYyxRQUFBQSxFQUFFLEVBQUUsS0FGQztBQUdMNkIsUUFBQUEsTUFBTSxFQUFFLE1BSEg7QUFJTHBDLFFBQUFBLFdBQVcsRUFBRVYsSUFBSSxDQUFDVSxXQUpiO0FBS0xDLFFBQUFBLFdBQVcsRUFBRVgsSUFBSSxDQUFDVyxXQUxiO0FBTUxDLFFBQUFBLGlCQUFpQixFQUFFWixJQUFJLENBQUNZLGlCQU5uQjtBQU9MbUMsUUFBQUEsVUFQSztBQUFBLDhCQU9NQyxRQVBOLEVBT2dCO0FBQ3BCaEQsWUFBQUEsSUFBSSxDQUFDTSxhQUFMLENBQW1CcUIsUUFBbkIsQ0FBNEIsU0FBNUI7QUFDQSxnQkFBTXNCLGtCQUFrQixHQUFHakQsSUFBSSxDQUFDSSxnQkFBTCxDQUFzQjRDLFFBQXRCLENBQTNCOztBQUNBLGdCQUFJQyxrQkFBa0IsS0FBSyxLQUEzQixFQUFrQztBQUNqQ2pELGNBQUFBLElBQUksQ0FBQ00sYUFBTCxDQUNFNEMsVUFERixDQUNhLE9BRGIsRUFFRXhCLFdBRkYsQ0FFYyxTQUZkO0FBR0EsYUFKRCxNQUlPO0FBQ05uQixjQUFBQSxDQUFDLENBQUM0QyxJQUFGLENBQU9GLGtCQUFrQixDQUFDRyxJQUExQixFQUFnQyxVQUFDQyxLQUFELEVBQVF0QixLQUFSLEVBQWtCO0FBQ2pELG9CQUFJc0IsS0FBSyxDQUFDQyxPQUFOLENBQWMsT0FBZCxJQUF5QixDQUFDLENBQTFCLElBQStCRCxLQUFLLENBQUNDLE9BQU4sQ0FBYyxTQUFkLElBQTJCLENBQUMsQ0FBL0QsRUFBa0U7QUFDbEUsb0JBQUksT0FBT3ZCLEtBQVAsS0FBaUIsUUFBckIsRUFBK0JrQixrQkFBa0IsQ0FBQ0csSUFBbkIsQ0FBd0JDLEtBQXhCLElBQWlDdEIsS0FBSyxDQUFDd0IsSUFBTixFQUFqQztBQUMvQixlQUhEO0FBSUE7O0FBQ0QsbUJBQU9OLGtCQUFQO0FBQ0E7O0FBckJJO0FBQUE7QUFzQkwxQixRQUFBQSxTQXRCSztBQUFBLDZCQXNCS2lDLFFBdEJMLEVBc0JlO0FBQ25CakQsWUFBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0JrRCxNQUF0QjtBQUNBbEQsWUFBQUEsQ0FBQyxDQUFDNEMsSUFBRixDQUFPSyxRQUFRLENBQUNFLE9BQWhCLEVBQXlCLFVBQUNMLEtBQUQsRUFBUXRCLEtBQVIsRUFBa0I7QUFDMUMsa0JBQUlzQixLQUFLLEtBQUssT0FBZCxFQUF1QjtBQUN0QnJELGdCQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUI0QyxVQUFuQixDQUE4QixPQUE5QixFQUF1Q3hCLFdBQXZDLENBQW1ELFNBQW5EO0FBQ0ExQixnQkFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWMwRCxLQUFkLDJCQUFzQ04sS0FBdEMsNkJBQTZEdEIsS0FBN0Q7QUFDQTtBQUNELGFBTEQ7QUFNQSxnQkFBTTZCLEtBQUssR0FBR0MsUUFBUSxDQUFDQyxXQUFULENBQXFCLE9BQXJCLENBQWQ7QUFDQUYsWUFBQUEsS0FBSyxDQUFDRyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxLQUFyQyxFQUE0QyxJQUE1QztBQUNBQyxZQUFBQSxNQUFNLENBQUNDLGFBQVAsQ0FBcUJMLEtBQXJCO0FBQ0E1RCxZQUFBQSxJQUFJLENBQUNLLGVBQUwsQ0FBcUJtRCxRQUFyQjs7QUFDQSxnQkFBSUEsUUFBUSxDQUFDVSxPQUFULElBQ0FWLFFBQVEsQ0FBQ1csTUFBVCxDQUFnQnZDLE1BQWhCLEdBQXlCLENBRHpCLElBRUE1QixJQUFJLENBQUNTLGdCQUFMLENBQXNCd0IsR0FBdEIsT0FBZ0MsY0FGcEMsRUFFb0Q7QUFDbkQrQixjQUFBQSxNQUFNLENBQUNJLFFBQVAsR0FBa0JDLGFBQWEsR0FBR2IsUUFBUSxDQUFDVyxNQUEzQztBQUNBLGFBSkQsTUFJTyxJQUFJWCxRQUFRLENBQUNVLE9BQVQsSUFBb0JsRSxJQUFJLENBQUNTLGdCQUFMLENBQXNCd0IsR0FBdEIsT0FBZ0MsdUJBQXhELEVBQWlGO0FBQ3ZGLGtCQUFNcUMsUUFBUSxHQUFHTixNQUFNLENBQUNJLFFBQVAsQ0FBZ0JHLElBQWhCLENBQXFCQyxLQUFyQixDQUEyQixRQUEzQixDQUFqQjs7QUFDQSxrQkFBSUYsUUFBUSxDQUFDMUMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN4Qm9DLGdCQUFBQSxNQUFNLENBQUNJLFFBQVAsYUFBcUJFLFFBQVEsQ0FBQyxDQUFELENBQTdCO0FBQ0E7QUFDRCxhQUxNLE1BS0EsSUFBSWQsUUFBUSxDQUFDVSxPQUFULElBQW9CbEUsSUFBSSxDQUFDUyxnQkFBTCxDQUFzQndCLEdBQXRCLE9BQWdDLHFCQUF4RCxFQUErRTtBQUNyRixrQkFBTXFDLFNBQVEsR0FBR04sTUFBTSxDQUFDSSxRQUFQLENBQWdCRyxJQUFoQixDQUFxQkMsS0FBckIsQ0FBMkIsUUFBM0IsQ0FBakI7O0FBQ0Esa0JBQUlGLFNBQVEsQ0FBQzFDLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDeEJvQyxnQkFBQUEsTUFBTSxDQUFDSSxRQUFQLGFBQXFCRSxTQUFRLENBQUMsQ0FBRCxDQUE3QjtBQUNBO0FBQ0QsYUFMTSxNQUtBLElBQUlkLFFBQVEsQ0FBQ1UsT0FBVCxJQUNOVixRQUFRLENBQUNXLE1BQVQsQ0FBZ0J2QyxNQUFoQixHQUF5QixDQUR2QixFQUMwQjtBQUNoQ29DLGNBQUFBLE1BQU0sQ0FBQ0ksUUFBUCxHQUFrQkMsYUFBYSxHQUFHYixRQUFRLENBQUNXLE1BQTNDO0FBQ0EsYUFITSxNQUdBLElBQUluRSxJQUFJLENBQUNhLGFBQVQsRUFBd0I7QUFDOUJiLGNBQUFBLElBQUksQ0FBQ2dCLGlCQUFMO0FBQ0E7O0FBQ0RoQixZQUFBQSxJQUFJLENBQUNNLGFBQUwsQ0FBbUJvQixXQUFuQixDQUErQixTQUEvQjtBQUNBOztBQXZESTtBQUFBO0FBd0RMRCxRQUFBQSxTQXhESztBQUFBLDZCQXdESytCLFFBeERMLEVBd0RlO0FBQ25CeEQsWUFBQUEsSUFBSSxDQUFDQyxRQUFMLENBQWMwRCxLQUFkLENBQW9CSCxRQUFwQjtBQUNBeEQsWUFBQUEsSUFBSSxDQUFDTSxhQUFMLENBQ0U0QyxVQURGLENBQ2EsT0FEYixFQUVFeEIsV0FGRixDQUVjLFNBRmQ7QUFHQTs7QUE3REk7QUFBQTtBQUFBLE9BQU47QUFnRUE7O0FBL0pXO0FBQUE7QUFBQSxDQUFiLEMsQ0FrS0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChDKSBNSUtPIExMQyAtIEFsbCBSaWdodHMgUmVzZXJ2ZWRcbiAqIFVuYXV0aG9yaXplZCBjb3B5aW5nIG9mIHRoaXMgZmlsZSwgdmlhIGFueSBtZWRpdW0gaXMgc3RyaWN0bHkgcHJvaGliaXRlZFxuICogUHJvcHJpZXRhcnkgYW5kIGNvbmZpZGVudGlhbFxuICogV3JpdHRlbiBieSBOaWtvbGF5IEJla2V0b3YsIDEyIDIwMTlcbiAqXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSAqL1xuXG5jb25zdCBGb3JtID0ge1xuXHQkZm9ybU9iajogJycsXG5cdHZhbGlkYXRlUnVsZXM6IHt9LFxuXHR1cmw6ICcnLFxuXHRjYkJlZm9yZVNlbmRGb3JtOiAnJyxcblx0Y2JBZnRlclNlbmRGb3JtOiAnJyxcblx0JHN1Ym1pdEJ1dHRvbjogJCgnI3N1Ym1pdGJ1dHRvbicpLFxuXHQkZHJvcGRvd25TdWJtaXQ6ICQoJyNkcm9wZG93blN1Ym1pdCcpLFxuXHQkc3VibWl0TW9kZUlucHV0OiAkKCdpbnB1dFtuYW1lPVwic3VibWl0TW9kZVwiXScpLFxuXHRwcm9jZXNzRGF0YTogdHJ1ZSxcblx0Y29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnLFxuXHRrZXlib2FyZFNob3J0Y3V0czogdHJ1ZSxcblx0ZW5hYmxlRGlycml0eTogdHJ1ZSxcblx0b2xkRm9ybVZhbHVlczogW10sXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0aWYgKEZvcm0uZW5hYmxlRGlycml0eSkgRm9ybS5pbml0aWFsaXplRGlycml0eSgpO1xuXG5cdFx0Rm9ybS4kc3VibWl0QnV0dG9uLm9uKCdjbGljaycsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoRm9ybS4kc3VibWl0QnV0dG9uLmhhc0NsYXNzKCdsb2FkaW5nJykpIHJldHVybjtcblx0XHRcdGlmIChGb3JtLiRzdWJtaXRCdXR0b24uaGFzQ2xhc3MoJ2Rpc2FibGVkJykpIHJldHVybjtcblx0XHRcdEZvcm0uJGZvcm1PYmpcblx0XHRcdFx0LmZvcm0oe1xuXHRcdFx0XHRcdG9uOiAnYmx1cicsXG5cdFx0XHRcdFx0ZmllbGRzOiBGb3JtLnZhbGlkYXRlUnVsZXMsXG5cdFx0XHRcdFx0b25TdWNjZXNzKCkge1xuXHRcdFx0XHRcdFx0Rm9ybS5zdWJtaXRGb3JtKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvbkZhaWx1cmUoKSB7XG5cdFx0XHRcdFx0XHRGb3JtLiRmb3JtT2JqLnJlbW92ZUNsYXNzKCdlcnJvcicpLmFkZENsYXNzKCdlcnJvcicpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pO1xuXHRcdFx0Rm9ybS4kZm9ybU9iai5mb3JtKCd2YWxpZGF0ZSBmb3JtJyk7XG5cdFx0fSk7XG5cdFx0aWYgKEZvcm0uJGRyb3Bkb3duU3VibWl0Lmxlbmd0aCA+IDApIHtcblx0XHRcdEZvcm0uJGRyb3Bkb3duU3VibWl0LmRyb3Bkb3duKHtcblx0XHRcdFx0b25DaGFuZ2U6ICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHRyYW5zbGF0ZUtleSA9IGBidF8ke3ZhbHVlfWA7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCh2YWx1ZSk7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uXG5cdFx0XHRcdFx0XHQuaHRtbChgPGkgY2xhc3M9XCJzYXZlIGljb25cIj48L2k+ICR7Z2xvYmFsVHJhbnNsYXRlW3RyYW5zbGF0ZUtleV19YClcblx0XHRcdFx0XHRcdC5jbGljaygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdEZvcm0uJGZvcm1PYmoub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQmNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQvtGC0YHQu9C10LbQuNCy0LDQvdC40Y8g0LjQt9C80LXQvdC10L3QuNC5INGE0L7RgNC80Ytcblx0ICovXG5cdGluaXRpYWxpemVEaXJyaXR5KCkge1xuXHRcdEZvcm0uc2F2ZUluaXRpYWxWYWx1ZXMoKTtcblx0XHRGb3JtLnNldEV2ZW50cygpO1xuXHRcdEZvcm0uJHN1Ym1pdEJ1dHRvbi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHRGb3JtLiRkcm9wZG93blN1Ym1pdC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0fSxcblx0LyoqXG5cdCAqINCh0L7RhdGA0LDQvdGP0LXRgiDQv9C10YDQstC+0L3QsNGH0LDQu9GM0L3Ri9C1INC30L3QsNGH0LXQvdC40Y8g0LTQu9GPINC/0YDQvtCy0LXRgNC60Lgg0L3QsCDQuNC30LzQtdC90LXQvdC40Y8g0YTQvtGA0LzRi1xuXHQgKi9cblx0c2F2ZUluaXRpYWxWYWx1ZXMoKSB7XG5cdFx0Rm9ybS5vbGRGb3JtVmFsdWVzID0gRm9ybS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQl9Cw0L/Rg9GB0LrQsNC10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDQuNC30LzQtdC90LXQvdC40Y8g0L7QsdGK0LXQutGC0L7QsiDRhNC+0YDQvNGLXG5cdCAqL1xuXHRzZXRFdmVudHMoKSB7XG5cdFx0Rm9ybS4kZm9ybU9iai5maW5kKCdpbnB1dCwgc2VsZWN0JykuY2hhbmdlKCgpID0+IHtcblx0XHRcdEZvcm0uY2hlY2tWYWx1ZXMoKTtcblx0XHR9KTtcblx0XHRGb3JtLiRmb3JtT2JqLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYScpLm9uKCdrZXl1cCBrZXlkb3duIGJsdXInLCAoKSA9PiB7XG5cdFx0XHRGb3JtLmNoZWNrVmFsdWVzKCk7XG5cdFx0fSk7XG5cdFx0Rm9ybS4kZm9ybU9iai5maW5kKCcudWkuY2hlY2tib3gnKS5vbignY2xpY2snLCAoKSA9PiB7XG5cdFx0XHRGb3JtLmNoZWNrVmFsdWVzKCk7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiDQodCy0LXRgNGP0LXRgiDQuNC30LzQtdC90LXQvdC40Y8g0YHRgtCw0YDRi9GFINC4INC90L7QstGL0YUg0LfQvdCw0YfQtdC90LjQuSDRhNC+0YDQvNGLXG5cdCAqL1xuXHRjaGVja1ZhbHVlcygpIHtcblx0XHRjb25zdCBuZXdGb3JtVmFsdWVzID0gRm9ybS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KEZvcm0ub2xkRm9ybVZhbHVlcykgPT09IEpTT04uc3RyaW5naWZ5KG5ld0Zvcm1WYWx1ZXMpKSB7XG5cdFx0XHRGb3JtLiRzdWJtaXRCdXR0b24uYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XHRGb3JtLiRkcm9wZG93blN1Ym1pdC5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0Rm9ybS4kZHJvcGRvd25TdWJtaXQucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICog0J7RgtC/0YDQsNCy0LrQsCDRhNC+0YDQvNGLINC90LAg0YHQtdGA0LLQtdGAXG5cdCAqL1xuXHRzdWJtaXRGb3JtKCkge1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogRm9ybS51cmwsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdHByb2Nlc3NEYXRhOiBGb3JtLnByb2Nlc3NEYXRhLFxuXHRcdFx0Y29udGVudFR5cGU6IEZvcm0uY29udGVudFR5cGUsXG5cdFx0XHRrZXlib2FyZFNob3J0Y3V0czogRm9ybS5rZXlib2FyZFNob3J0Y3V0cyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdGNvbnN0IGNiQmVmb3JlU2VuZFJlc3VsdCA9IEZvcm0uY2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncyk7XG5cdFx0XHRcdGlmIChjYkJlZm9yZVNlbmRSZXN1bHQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uXG5cdFx0XHRcdFx0XHQudHJhbnNpdGlvbignc2hha2UnKVxuXHRcdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JC5lYWNoKGNiQmVmb3JlU2VuZFJlc3VsdC5kYXRhLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXguaW5kZXhPZignZWNyZXQnKSA+IC0xIHx8IGluZGV4LmluZGV4T2YoJ2Fzc3dvcmQnKSA+IC0xKSByZXR1cm47XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgY2JCZWZvcmVTZW5kUmVzdWx0LmRhdGFbaW5kZXhdID0gdmFsdWUudHJpbSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjYkJlZm9yZVNlbmRSZXN1bHQ7XG5cdFx0XHR9LFxuXHRcdFx0b25TdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLm1lc3NhZ2UsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHRpZiAoaW5kZXggPT09ICdlcnJvcicpIHtcblx0XHRcdFx0XHRcdEZvcm0uJHN1Ym1pdEJ1dHRvbi50cmFuc2l0aW9uKCdzaGFrZScpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG5cdFx0XHRcdFx0XHRGb3JtLiRmb3JtT2JqLmFmdGVyKGA8ZGl2IGNsYXNzPVwidWkgJHtpbmRleH0gbWVzc2FnZSBhamF4XCI+JHt2YWx1ZX08L2Rpdj5gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXHRcdFx0XHRldmVudC5pbml0RXZlbnQoJ0NvbmZpZ0RhdGFDaGFuZ2VkJywgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0XHRcdEZvcm0uY2JBZnRlclNlbmRGb3JtKHJlc3BvbnNlKTtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLnN1Y2Nlc3Ncblx0XHRcdFx0XHQmJiByZXNwb25zZS5yZWxvYWQubGVuZ3RoID4gMFxuXHRcdFx0XHRcdCYmIEZvcm0uJHN1Ym1pdE1vZGVJbnB1dC52YWwoKSA9PT0gJ1NhdmVTZXR0aW5ncycpIHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBnbG9iYWxSb290VXJsICsgcmVzcG9uc2UucmVsb2FkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MgJiYgRm9ybS4kc3VibWl0TW9kZUlucHV0LnZhbCgpID09PSAnU2F2ZVNldHRpbmdzQW5kQWRkTmV3Jykge1xuXHRcdFx0XHRcdGNvbnN0IGVtcHR5VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJ21vZGlmeScpO1xuXHRcdFx0XHRcdGlmIChlbXB0eVVybC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBgJHtlbXB0eVVybFswXX1tb2RpZnkvYDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiBGb3JtLiRzdWJtaXRNb2RlSW5wdXQudmFsKCkgPT09ICdTYXZlU2V0dGluZ3NBbmRFeGl0Jykge1xuXHRcdFx0XHRcdGNvbnN0IGVtcHR5VXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJ21vZGlmeScpO1xuXHRcdFx0XHRcdGlmIChlbXB0eVVybC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gPSBgJHtlbXB0eVVybFswXX1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChyZXNwb25zZS5zdWNjZXNzXG5cdFx0XHRcdFx0XHQmJiByZXNwb25zZS5yZWxvYWQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IGdsb2JhbFJvb3RVcmwgKyByZXNwb25zZS5yZWxvYWQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoRm9ybS5lbmFibGVEaXJyaXR5KSB7XG5cdFx0XHRcdFx0Rm9ybS5pbml0aWFsaXplRGlycml0eSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdEZvcm0uJHN1Ym1pdEJ1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuXHRcdFx0fSxcblx0XHRcdG9uRmFpbHVyZShyZXNwb25zZSkge1xuXHRcdFx0XHRGb3JtLiRmb3JtT2JqLmFmdGVyKHJlc3BvbnNlKTtcblx0XHRcdFx0Rm9ybS4kc3VibWl0QnV0dG9uXG5cdFx0XHRcdFx0LnRyYW5zaXRpb24oJ3NoYWtlJylcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcblx0XHRcdH0sXG5cblx0XHR9KTtcblx0fSxcbn07XG5cbi8vIGV4cG9ydCBkZWZhdWx0IEZvcm07XG4iXX0=