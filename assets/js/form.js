var Form = function (formId) {
    this.form = $('#' + formId),
    this.getMoney = [],
    this.setMoney = function (input) { 
        if(typeof input != 'undefined' && Array.isArray(input)) {
            for (var i in input) {
                $(this[input[i]]).maskMoney({thousands:'.', decimal:',', allowZero: true});
                this.getMoney.push(input[i]);
            }
        }
    },
    this.inputs = function () {
        var $inputs = this.form.find(':input'), data = {};
        $inputs.each(function (k, v) {
            if (v.name) {
                data[v.name] = this;
            }
        });
        return data;
    },
    this.getSelected = function (name) {
        var selected = this.form.find('select[name=' + name + '] option:selected');
        return {text: selected.text(), value: selected.val()};
    },
    this.isChecked = function (name) {
        var checked = this.form.find('input[name=' + name + ']:checked').val();
        return (typeof checked != 'undefined' ? checked : false);
    },  
    this.send = function (url, callback)
    {
        var ajaxParams = {},
            data = this.getFormData(),
            inputFiles = this.form.find(':input[type="file"]');

        ajaxParams.url = url;
        ajaxParams.type = 'POST';
        ajaxParams.data = data;
        ajaxParams.dataType = 'json';

        if (inputFiles.length > 0) {
            var newAjaxParams = Util.getInputFilesData(inputFiles, ajaxParams);
            $.extend(ajaxParams, newAjaxParams);
        }

        $.blockUI();
        var ajax = $.ajax(ajaxParams);
        ajax.always(function (data) {
            $.unblockUI();
            if (typeof callback == 'function')
                callback(data);
        });
    },
    this.getFormData = function ()
    {
        var form = this, $inputs = form.form.find(':input'), data = {};
        $inputs.each(function (k, v) {
            if (v.name) {
                if (v.type == 'checkbox' || v.type == 'radio') {
                    if(typeof data[v.name] == 'undefined'){
                        data[v.name] = [];
                    }
                    if ($(this).is(':checked')) {
                        data[v.name].push(v.value);
                    }
                } else {
                    // teste se é valor monetario
                    if (form.getMoney.indexOf(v.name) !== -1) {
                        data[v.name] = $(form[v.name]).maskMoney('unmasked')[0];
                    } else {
                        data[v.name] = v.value;
                    }
                }
            }
        });
        return data;
    },
    this.setFormData = function (data)
    {
        var $inputs = this.form.find(':input');
        var money = this.getMoney;
        $inputs.each(function (k, v) {
            nameCompare = v.name.replace('[', '').replace(']', '');
            // input
            if (typeof data[nameCompare] != "undefined") {
                if (v.type != 'file') {
                    if (v.type == 'checkbox' || v.type == 'radio') {
                        if (Object.prototype.toString.call(data[nameCompare]) == "[object Array]") {
                            for (var i in data[nameCompare]) {
                                if ($(this).val() == data[nameCompare][i]) {
                                    $(this).prop('checked', true);
                                }
                            }
                        } else {
                            if ($(this).val() == data[nameCompare]) {
                                $(this).prop('checked', true);
                            }
                        }

                    } else {
                        // verifica se o campo é monetario e formata
                        if($.inArray(nameCompare, money) != -1){
                            data[nameCompare] = Util.formatNumber(data[nameCompare]);
                        }
                        $(this).val(data[nameCompare]);
                    }
                }
            }
        });
    },
    this.addOptionsSelect = function (selectName, data)
    {
        var select = this.form.find('select[name=' + selectName + ']');
        $.each(data, function (key, value) {
            if (typeof value == "object") {
                key = value.ID;
                value = value.TEXTO;
            }
            select.append($("<option></option>").attr("value", key).text(value));
        });
    },
    this.addCheckboxInLine = function (destinyId, checkboxName, data)
    {
        var destiny = this.form.find('#' + destinyId), checkbox = '';
        $.each(data, function (key, value) {
            if (typeof value == "object") {
                key = value.ID;
                value = value.TEXTO;
            }
            checkbox += '<label class="checkbox"><input type="checkbox" name="' + checkboxName + '[]" value="' + key + '"><i></i>' + value + '</label>' + "\n";
        });
        destiny.append($("<div></div>").attr("class", "inline-group").html(checkbox));
    },
    this.clear = function (itemName) {
        // se nao informar o itemName limpa todos os itens do form
        if (typeof itemName != 'undefined') {
            var clearItem = function (item) {
                var qtdItem = item.length;
                if (qtdItem > 1) {
                    for(var i=0; i<qtdItem; i++){
                        if (item[i].type == 'checkbox' || item[i].type == 'radio') {
                            item[i].checked = false;
                        } else {
                            item[i].value = '';
                        }
                    }
                } else {
                    item.value = '';
                }
            };
            
            // para limpar apenas um campo, informa o attr name
            if (typeof itemName == 'string') {    
                clearItem(this[itemName]);
                
            // para mais de um item envia um array com os attr name
            } else if (typeof itemName == 'object') {
                for (var i in itemName) {
                    clearItem(this[itemName[i]]);
                }
            }
            
        } else {
            var input = this.inputs();
            for (var i in input) {
                switch(input[i].type) {
                    case 'password':
                    case 'select-multiple':
                    case 'select-one':
                    case 'text':
                    case 'textarea':
                        input[i].value = '';
                        break;
                    case 'checkbox':
                    case 'radio':
                        for (var ii in input[i].input)
                            input[i].input[ii].checked = false;
                        break;
                }
            }
        }
    };
    
    var $inputs = this.form.find(':input'), data = this;
    $inputs.each(function (k, v) {
        if (v.name) {
            data[v.name] = this;
        }
    });
    
};

var Util = {
    copyElement: function ($element) {
        $element.select();
        this.copyText($element.text());
    },
    copyText: function (text) {
        var $tempInput = $("<textarea>");
        $("body").append($tempInput);
        $tempInput.val(text).select();
        document.execCommand("copy");
        $tempInput.remove();

        myApp.addNotification({
            title: 'Copiado...',
            hold: 1500
        });
    },
    formatNumber: function (n, c, d, t) {
        var n,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "," : d,
            t = t == undefined ? "." : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    },
    formatNumberBR: function (n, c) {
        var n,
            c = isNaN(c = Math.abs(c)) ? 2 : c;
        n.replace('.', '');
        nFormatado = parseFloat(n.replace(',', '.'));
        return parseFloat(nFormatado.toFixed(2));
    },
    getEnderecoByCEP: function (cep, callback) {
        cep = cep.replace('-', '');
        var ajax = $.ajax({
            url: 'http://viacep.com.br/ws/' + cep + '/json/',
            //type: 'GET',
            dataType: "json"
        });
        ajax.always(function (data) {
            callback(data);
        });
    },
    ajaxPost: function (url, param, callback, dataType) {
        this.ajax('POST', url, param, callback, dataType);
    },
    ajaxGet: function (url, param, callback, dataType) {
        this.ajax('GET', url, param, callback, dataType);
    },
    ajax: function (method, url, param, callback, dataType) {
        var callback = (callback || null), 
            ajax = $.ajax({
                url: url,
                type: method,
                data: (param || ''),
                dataType: (dataType || "json")
            });
        ajax.always(function (data) {
            if(typeof callback == 'function') {
                callback(data);
            }
        });
    },
    reloadPage: function () {
        window.location.reload(false);
    },
    getInputFilesData: function(inputFiles, ajaxParams) {

        var formData = new FormData(),
        extraData = ajaxParams.data;

        // Seta parametros necessários para a request funcionar com input file
        ajaxParams.cache = false;
        ajaxParams.contentType = false;
        ajaxParams.processData = false;

        for (var i in inputFiles) {
            if (typeof inputFiles[i].files != 'undefined') {
                if (inputFiles[i].files.length > 0) {
                    formData.append(inputFiles[i].name, inputFiles[i].files[0]);
                }
            }
        }

        // Inserindo os dados extras do form no obj formdata (requisito para funcionar com input file)
        if (typeof extraData != 'undefined' && Object.keys(extraData).length > 0) {
        $.each(extraData, function(k,v) {

                // tipo de valor
                var vType = Object.prototype.toString.call(v);

                // verifica se o valor é um ARRAY
                if (vType == '[object Array]') {
                        for (var i in v) { formData.append(k, v[i]); }

                // verifica se o valor é um OBJECT
                        } else if (vType == '[object Object]') {
                        for (var i in v) { formData.append(k + '[' + i + ']', v[i]); }

                } else {
                formData.append(k, v);

                }

        });
        }

        ajaxParams.data = formData;

        return ajaxParams;
    }
};